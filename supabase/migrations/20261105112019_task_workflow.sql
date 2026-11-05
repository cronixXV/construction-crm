-- =====================================================================
-- Миграция 003: бизнес-логика статусов задач
-- Автоматическая запись в историю при создании задачи
-- =====================================================================

-- ---------------------------------------------------------------------
-- Триггерная функция: первая запись истории
--
-- SECURITY DEFINER: у authenticated нет INSERT на task_status_history,
--   поэтому запись выполняется с правами владельца функции.
-- search_path = '' : все объекты квалифицированы схемой.
-- Лежит в private: не публикуется через REST API.
-- ---------------------------------------------------------------------
create or replace function private.log_task_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.task_status_history (
    task_id,
    changed_by,
    old_status,
    new_status,
    comment
  )
  values (
    new.id,
    new.author_id,
    null,
    new.status,
    null
  );

  return new;
end;
$$;

-- Прямой вызов никому не нужен: функцию вызывает только триггер.
revoke all on function private.log_task_created() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Триггер
-- ---------------------------------------------------------------------
create trigger trg_tasks_log_created
  after insert on public.tasks
  for each row
  execute function private.log_task_created();

-- ---------------------------------------------------------------------
-- Проверка допустимости перехода статуса
--
-- Чистая функция: таблиц не читает, поэтому SECURITY INVOKER.
-- Пользователя и роль она сама не определяет, их передаёт RPC
-- (из auth.uid() и profiles). Это безопасно, потому что функция лежит
-- в private и у authenticated нет EXECUTE: клиент не может вызвать её
-- с подставленными значениями.
-- Если переход разрешён, функция ничего не возвращает; иначе RAISE EXCEPTION.
--
-- Коды ошибок (PostgREST переводит их в HTTP-статусы):
--   42501 -> 403  нет прав (чужая задача, чужая роль)
--   23514 -> 400  недопустимый переход / нет обязательного комментария
--   22004 -> 400  пустые параметры
-- ---------------------------------------------------------------------
create or replace function private.validate_task_status_transition(
  p_role        public.user_role,
  p_actor_id    uuid,
  p_assignee_id uuid,
  p_old_status  public.task_status,
  p_new_status  public.task_status,
  p_comment     text default null
)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  -- 0. Защита от пустых значений: NULL в условиях ниже дал бы "не сработало",
  --    а не ошибку, поэтому проверяем явно.
  if p_role is null or p_actor_id is null then
    raise exception 'Пользователь не найден или не имеет профиля'
      using errcode = '42501';
  end if;

  if p_old_status is null or p_new_status is null then
    raise exception 'Статус не может быть пустым'
      using errcode = '22004';
  end if;

  -- 1. Исполнитель
  if p_role = 'executor' then
    -- is distinct from корректно обрабатывает NULL в assignee_id
    if p_assignee_id is distinct from p_actor_id then
      raise exception 'Исполнитель может менять статус только своей задачи'
        using errcode = '42501';
    end if;

    if not (
         (p_old_status = 'new'      and p_new_status = 'in_progress')
      or (p_old_status = 'in_progress' and p_new_status = 'review')
      or (p_old_status = 'revision' and p_new_status = 'in_progress')
    ) then
      raise exception 'Исполнитель не может перевести задачу из "%" в "%"',
        p_old_status, p_new_status
        using errcode = '23514';
    end if;

  -- 2. Постановщик
  elsif p_role = 'manager' then
    if not (
         (p_old_status = 'review' and p_new_status = 'accepted')
      or (p_old_status = 'review' and p_new_status = 'revision')
    ) then
      raise exception 'Постановщик не может перевести задачу из "%" в "%"',
        p_old_status, p_new_status
        using errcode = '23514';
    end if;

    -- review -> revision: причина возврата обязательна
    if p_old_status = 'review'
       and p_new_status = 'revision'
       and btrim(coalesce(p_comment, '')) = '' then
      raise exception 'При возврате на доработку комментарий обязателен'
        using errcode = '23514';
    end if;

  -- 3. Любая другая (будущая) роль по умолчанию ничего не может
  else
    raise exception 'Роль "%" не может менять статус', p_role
      using errcode = '42501';
  end if;
end;
$$;

-- Вызывается только из RPC (SECURITY DEFINER, владелец postgres).
revoke all on function private.validate_task_status_transition(
  public.user_role, uuid, uuid, public.task_status, public.task_status, text
) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RPC change_task_status
--
-- Единственный способ сменить статус задачи с клиента.
-- Лежит в public, потому что PostgREST публикует как /rpc/ только эту схему.
-- SECURITY DEFINER: выполняется от имени владельца и обходит GRANT/RLS,
--   поэтому все проверки доступа сделаны внутри явно.
-- search_path = '' : все объекты квалифицированы схемой.
-- Пользователь и роль определяются только по auth.uid() и public.profiles.
-- ---------------------------------------------------------------------
create or replace function public.change_task_status(
  p_task_id    uuid,
  p_new_status public.task_status,
  p_comment    text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_role    public.user_role;
  v_task    public.tasks%rowtype;
  v_comment text := nullif(btrim(p_comment), '');
begin
  -- 1. Авторизация
  if v_uid is null then
    raise exception 'Требуется авторизация'
      using errcode = '42501';
  end if;

  -- 2. Роль из profiles (не из JWT и не из параметров)
  select p.role
    into v_role
  from public.profiles p
  where p.id = v_uid;

  if v_role is null then
    raise exception 'Профиль пользователя не найден'
      using errcode = '42501';
  end if;

  -- 3. Входные данные
  if p_task_id is null or p_new_status is null then
    raise exception 'Не указана задача или новый статус'
      using errcode = '22004';
  end if;

  if v_comment is not null and length(v_comment) > 2000 then
    raise exception 'Комментарий слишком длинный (максимум 2000 символов)'
      using errcode = '23514';
  end if;

  -- 4. Загрузка и блокировка задачи.
  --    Исполнитель ищет задачу только среди своих: чужая и несуществующая
  --    задачи для него неразличимы, существование чужих id не раскрывается.
  --    Параллельный вызов по той же задаче дождётся окончания транзакции
  --    и увидит уже новый статус.
  select t.*
    into v_task
  from public.tasks t
  where t.id = p_task_id
    and (v_role = 'manager' or t.assignee_id = v_uid)
  for update;

  if not found then
    raise exception 'Задача не найдена'
      using errcode = 'P0002';
  end if;

  -- 5. Проверка перехода на доверенных данных
  perform private.validate_task_status_transition(
    v_role,
    v_uid,
    v_task.assignee_id,
    v_task.status,
    p_new_status,
    v_comment
  );

  -- 6. Передаём комментарий будущему триггеру истории.
  --    true = значение действует только до конца текущей транзакции.
  perform set_config('app.task_status_comment', coalesce(v_comment, ''), true);

  -- 7. Смена статуса
  update public.tasks
     set status = p_new_status
   where id = v_task.id;
end;
$$;

-- CREATE FUNCTION даёт EXECUTE роли PUBLIC, а Supabase ещё и явно выдаёт anon.
revoke all on function public.change_task_status(uuid, public.task_status, text)
  from public, anon, authenticated;

grant execute on function public.change_task_status(uuid, public.task_status, text)
  to authenticated;

-- ---------------------------------------------------------------------
-- Триггер истории: запись при смене статуса
--
-- SECURITY DEFINER: у authenticated нет INSERT на task_status_history.
-- search_path = '' : все объекты квалифицированы схемой.
-- Комментарий приходит из RPC через GUC app.task_status_comment
--   (set_config(..., true) действует только до конца транзакции).
-- ---------------------------------------------------------------------
create or replace function private.log_task_status_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_comment text := nullif(btrim(current_setting('app.task_status_comment', true)), '');
begin

  -- changed_by NOT NULL. Без пользователя (SQL Editor, service_role без JWT)
  -- лучше остановить смену статуса, чем получить статус без записи об авторе.
  if v_uid is null then
    raise exception 'Не удалось определить пользователя для записи истории'
      using errcode = '42501';
  end if;

  insert into public.task_status_history (
    task_id,
    changed_by,
    old_status,
    new_status,
    comment
  )
  values (
    new.id,
    v_uid,
    old.status,
    new.status,
    v_comment
  );

  -- Сбрасываем комментарий, чтобы он не попал в следующую смену статуса
  -- внутри той же транзакции (например, при пакетном обновлении).
  perform set_config('app.task_status_comment', '', true);

  return new;
end;
$$;

revoke all on function private.log_task_status_changed() from public, anon, authenticated;

create trigger trg_tasks_log_status_changed
  after update of status on public.tasks
  for each row
  when (old.status is distinct from new.status)
  execute function private.log_task_status_changed();
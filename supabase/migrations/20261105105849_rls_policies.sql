-- =====================================================================
-- Миграция 002: GRANT/REVOKE, вспомогательные функции, RLS-политики
-- Модель: deny by default.
--   GRANT определяет, какие операции и столбцы доступны вообще,
--   RLS определяет, какие строки.
-- Триггеры истории и RPC смены статуса будут в следующей миграции.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. DEFAULT auth.uid() для авторских полей
-- ---------------------------------------------------------------------
alter table public.objects alter column created_by set default auth.uid();
alter table public.tasks   alter column author_id  set default auth.uid();

-- ---------------------------------------------------------------------
-- 2. Вспомогательные функции проверки роли
--    Лежат в схеме private, которая не публикуется через REST API,
--    поэтому их нельзя вызвать как /rpc/... снаружи.
--    SECURITY DEFINER: выполняются с правами владельца (postgres),
--    который обходит RLS на profiles. Благодаря этому нет рекурсии.
--    search_path = '' : все имена внутри полностью квалифицированы.
--    Никаких параметров: пользователь определяется только по auth.uid().
-- ---------------------------------------------------------------------
create schema if not exists private;

revoke all on schema private from public, anon;
revoke create on schema private from public, anon, authenticated;

grant usage on schema private to authenticated;

create or replace function private.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'manager'
  );
$$;

create or replace function private.is_executor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'executor'
  );
$$;

-- CREATE FUNCTION по умолчанию даёт EXECUTE роли PUBLIC, поэтому отзываем явно.
revoke all on function private.is_manager()    from public, anon, authenticated;
revoke all on function private.is_executor()   from public, anon, authenticated;

grant execute on function private.is_manager()    to authenticated;
grant execute on function private.is_executor()   to authenticated;

-- ---------------------------------------------------------------------
-- 3. REVOKE: сбрасываем всё, что Supabase выдаёт по умолчанию
-- ---------------------------------------------------------------------
revoke all on public.profiles            from anon, authenticated;
revoke all on public.objects             from anon, authenticated;
revoke all on public.tasks               from anon, authenticated;
revoke all on public.task_status_history from anon, authenticated;

-- Опционально: чтобы будущие таблицы тоже не получали права автоматически.
-- alter default privileges in schema public revoke all on tables    from anon, authenticated;
-- alter default privileges in schema public revoke all on functions from anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. GRANT: только authenticated, только необходимое
--    anon не получает ничего.
-- ---------------------------------------------------------------------
grant select on public.profiles            to authenticated;
grant select on public.objects             to authenticated;
grant select on public.tasks               to authenticated;
grant select on public.task_status_history to authenticated;

-- objects: id, created_by, created_at клиент задать или изменить не может
grant insert (name, address) on public.objects to authenticated;
grant update (name, address) on public.objects to authenticated;
grant delete                 on public.objects to authenticated;

-- tasks: status, author_id, created_at, id клиент не задаёт и не меняет.
-- При INSERT они заполняются DEFAULT-ами (new, auth.uid(), now(), gen_random_uuid()).
grant insert (title, description, object_id, assignee_id) on public.tasks to authenticated;
grant update (title, description, object_id, assignee_id) on public.tasks to authenticated;
grant delete                                              on public.tasks to authenticated;

-- profiles и task_status_history: только SELECT.

-- ---------------------------------------------------------------------
-- 5. RLS-политики
--    (select ...) вокруг функций заставляет Postgres вычислить значение
--    один раз на запрос, а не на каждую строку.
-- ---------------------------------------------------------------------

-- ===== profiles =====
-- Менеджер читает все профили, остальные только свой.
-- INSERT/UPDATE/DELETE: политик нет и прав нет, значит запрещено.
create policy profiles_select
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select private.is_manager())
  );

-- ===== objects =====
create policy objects_select
  on public.objects
  for select
  to authenticated
  using (
    (select private.is_manager())
    or exists (
      select 1
      from public.tasks t
      where t.object_id   = objects.id
        and t.assignee_id = (select auth.uid())
    )
  );

create policy objects_insert
  on public.objects
  for insert
  to authenticated
  with check (
    (select private.is_manager())
    and created_by = (select auth.uid())
  );

create policy objects_update
  on public.objects
  for update
  to authenticated
  using      ((select private.is_manager()))
  with check ((select private.is_manager()));

create policy objects_delete
  on public.objects
  for delete
  to authenticated
  using ((select private.is_manager()));

-- ===== tasks =====
create policy tasks_select
  on public.tasks
  for select
  to authenticated
  using (
    (select private.is_manager())
    or assignee_id = (select auth.uid())
  );

create policy tasks_insert
  on public.tasks
  for insert
  to authenticated
  with check (
    (select private.is_manager())
    and author_id = (select auth.uid())
    and status    = 'new'
    and exists (
      select 1
      from public.profiles p
      where p.id   = tasks.assignee_id
        and p.role = 'executor'
    )
  );

create policy tasks_update
  on public.tasks
  for update
  to authenticated
  using ((select private.is_manager()))
  with check (
    (select private.is_manager())
    and exists (
      select 1
      from public.profiles p
      where p.id   = tasks.assignee_id
        and p.role = 'executor'
    )
  );

create policy tasks_delete
  on public.tasks
  for delete
  to authenticated
  using ((select private.is_manager()));

-- ===== task_status_history =====
-- Только чтение. Запись будет делать триггер (SECURITY DEFINER).
-- Подзапрос к tasks выполняется под RLS tasks, поэтому исполнитель
-- видит историю только назначенных ему задач.
create policy history_select
  on public.task_status_history
  for select
  to authenticated
  using (
    (select private.is_manager())
    or exists (
      select 1
      from public.tasks t
      where t.id          = task_status_history.task_id
        and t.assignee_id = (select auth.uid())
    )
  );
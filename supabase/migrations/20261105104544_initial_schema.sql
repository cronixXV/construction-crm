-- =====================================================================
-- Миграция 001: базовая схема (enum-типы, таблицы, индексы, включение RLS)
-- Политики RLS и триггеры будут добавлены отдельными миграциями.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUM-типы
-- ---------------------------------------------------------------------
create type public.user_role as enum ('manager', 'executor');

create type public.task_status as enum (
  'new',
  'in_progress',
  'review',
  'accepted',
  'revision'
);

-- ---------------------------------------------------------------------
-- 2. profiles — пользователи (1:1 с auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  full_name  text not null default '',
  role public.user_role not null,
  created_at timestamptz not null default now(),

  constraint profiles_email_not_empty check (length(btrim(email)) > 0)
);

comment on table public.profiles is 'Профили пользователей; id совпадает с auth.users.id';
comment on column public.profiles.role is 'Роль хранится здесь, а не в user_metadata, которую пользователь может менять сам';

-- ---------------------------------------------------------------------
-- 3. objects — стройки
-- ---------------------------------------------------------------------
create table public.objects (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text not null default '',
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete restrict,

  constraint objects_name_not_empty check (length(btrim(name)) > 0)
);

-- ---------------------------------------------------------------------
-- 4. tasks — задачи
-- ---------------------------------------------------------------------
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  object_id   uuid not null references public.objects  (id) on delete restrict,
  assignee_id uuid not null references public.profiles (id) on delete restrict,
  author_id   uuid not null references public.profiles (id) on delete restrict,
  status      public.task_status not null default 'new',
  created_at  timestamptz not null default now(),

  constraint tasks_title_not_empty check (length(btrim(title)) > 0)
);

-- ---------------------------------------------------------------------
-- 5. task_status_history — история смены статусов
-- ---------------------------------------------------------------------
create table public.task_status_history (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks    (id) on delete cascade,
  changed_by uuid not null references public.profiles (id) on delete restrict,
  old_status public.task_status,            -- NULL допустим: у новой задачи нет предыдущего статуса
  new_status public.task_status not null,
  comment    text,
  created_at timestamptz not null default now(),

  constraint history_status_changed check (old_status is null or old_status <> new_status)
);

-- ---------------------------------------------------------------------
-- 6. Индексы по внешним ключам
-- ---------------------------------------------------------------------
create index tasks_object_id_idx   on public.tasks (object_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index tasks_author_id_idx   on public.tasks (author_id);

-- task_id + время: ускоряет и поиск истории задачи, и сортировку по дате
create index task_status_history_task_id_idx
  on public.task_status_history (task_id, created_at desc);

-- ---------------------------------------------------------------------
-- 7. Включаем RLS
-- ---------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.objects             enable row level security;
alter table public.tasks               enable row level security;
alter table public.task_status_history enable row level security;
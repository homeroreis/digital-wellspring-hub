-- Enums
create type public.content_type as enum ('devoc_meditacao', 'devoc_oracao', 'artigo', 'video');
create type public.challenge_recurrence as enum ('daily','weekly');
create type public.activity_type as enum ('devoc','challenge');
create type public.app_role as enum ('admin','user');

-- Helper: update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Role check function (security definer to bypass RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  );
$$;

-- Seasons (gamification cycles)
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  sunday_wednesday_multiplier numeric not null default 1.0,
  created_at timestamptz not null default now()
);

alter table public.seasons enable row level security;
-- Public can read seasons
create policy "Public can read seasons" on public.seasons for select using (true);
-- Only admins can modify seasons
create policy "Admins can modify seasons" on public.seasons for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Contents (devotionals, articles, videos)
create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  type public.content_type not null,
  title text not null,
  scripture_refs text[],
  author text,
  body text,
  media_url text,
  tags text[],
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists idx_contents_type on public.contents(type);
create index if not exists idx_contents_is_public on public.contents(is_public);
create index if not exists idx_contents_tags on public.contents using gin (tags);

create trigger set_contents_updated_at before update on public.contents for each row execute function public.set_updated_at();

alter table public.contents enable row level security;
create policy "Anyone can read public contents" on public.contents for select using (is_public = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins can insert contents" on public.contents for insert with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update contents" on public.contents for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete contents" on public.contents for delete using (public.has_role(auth.uid(), 'admin'));

-- Challenges
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  points_base integer not null default 0,
  recurrence public.challenge_recurrence not null,
  weekdays smallint[], -- 0=domingo .. 6=sabado
  season_id uuid references public.seasons(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  meta jsonb
);
create trigger set_challenges_updated_at before update on public.challenges for each row execute function public.set_updated_at();

alter table public.challenges enable row level security;
create policy "Public can read active challenges" on public.challenges for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins can modify challenges" on public.challenges for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Badges
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  criteria jsonb,
  created_at timestamptz not null default now()
);

alter table public.badges enable row level security;
create policy "Public can read badges" on public.badges for select using (true);
create policy "Admins can modify badges" on public.badges for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- User roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  unique (user_id, role)
);

alter table public.user_roles enable row level security;
-- Users can view their own roles
create policy "Users can view their own roles" on public.user_roles for select using (auth.uid() = user_id);
-- Admins can manage roles
create policy "Admins can manage roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- User activity (points log)
create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type public.activity_type not null,
  ref_id uuid,
  points_awarded integer not null default 0,
  occurred_at timestamptz not null default now(),
  meta jsonb
);
create index if not exists idx_user_activity_user on public.user_activity(user_id);
create index if not exists idx_user_activity_occurred on public.user_activity(occurred_at);

alter table public.user_activity enable row level security;
create policy "Users manage their own activity" on public.user_activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User badges
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_id)
);
create index if not exists idx_user_badges_user on public.user_badges(user_id);

alter table public.user_badges enable row level security;
create policy "Users manage their own badges" on public.user_badges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional: public.read-only views could be added later

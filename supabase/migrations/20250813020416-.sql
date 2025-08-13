-- Create table to store questionnaire results
create table if not exists public.questionnaire_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_score integer not null,
  total_time_spent integer not null default 0,
  comportamento_score integer not null default 0,
  vida_cotidiana_score integer not null default 0,
  relacoes_score integer not null default 0,
  espiritual_score integer not null default 0,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.questionnaire_results enable row level security;

-- Policies: users can manage only their own results
create policy "Users can view own results"
  on public.questionnaire_results
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own results"
  on public.questionnaire_results
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own results"
  on public.questionnaire_results
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own results"
  on public.questionnaire_results
  for delete
  using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_questionnaire_results_user_id on public.questionnaire_results(user_id);
create index if not exists idx_questionnaire_results_created_at on public.questionnaire_results(created_at);

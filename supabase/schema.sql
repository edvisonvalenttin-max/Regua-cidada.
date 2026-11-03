-- Régua Cidadã: esquema inicial. Execute no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.politicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  party text,
  jurisdiction text not null,
  term text,
  source_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null check (source_type in ('official','journalistic','audit','academic','citizen','other')),
  url text not null,
  publisher text,
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  politician_id uuid references public.politicians(id) on delete set null,
  title text not null,
  claim text,
  status text not null default 'unverified' check (status in ('corroborated','partial','conflicting','unverified','corrected')),
  source_type text not null default 'other',
  source_url text not null,
  source_id uuid references public.sources(id) on delete set null,
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  limitations text,
  created_at timestamptz not null default now()
);

create table if not exists public.citizen_submissions (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid references public.evidence(id) on delete cascade,
  submission_type text not null check (submission_type in ('challenge','correction','document','comment')),
  description text not null,
  document_url text,
  status text not null default 'pending' check (status in ('pending','under_review','accepted','rejected')),
  created_at timestamptz not null default now()
);

-- Ativação inicial de RLS. Leitura pública; escrita apenas por equipe autenticada/admin,
-- a ser refinada com papéis e políticas antes de abrir contribuições públicas.
alter table public.politicians enable row level security;
alter table public.sources enable row level security;
alter table public.evidence enable row level security;
alter table public.citizen_submissions enable row level security;

create policy "Public can read politicians" on public.politicians for select using (true);
create policy "Public can read sources" on public.sources for select using (true);
create policy "Public can read evidence" on public.evidence for select using (true);

-- Não habilite escrita pública até configurar autenticação, moderação e papéis administrativos.

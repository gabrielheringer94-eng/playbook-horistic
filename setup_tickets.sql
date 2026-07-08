-- ═══════════════════════════════════════════════
-- SETUP DA TABELA DE TICKETS · Playbook Horistic
-- Rode este SQL no Supabase: SQL Editor → New query
-- Projeto: feydpbqdsekolowcxska
-- ═══════════════════════════════════════════════

create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  titulo text not null,
  descricao text not null,
  quadrante int not null,          -- 0=Fazer agora, 1=Agendar, 2=Delegar, 3=Backlog
  sla_horas int not null,          -- 4, 48, 24, 120
  dono text not null,              -- Caio, Fernando, Victor, Gabriel
  dono_email text not null,
  autor text not null,
  autor_email text not null,
  status text default 'aberto',    -- aberto → andamento → concluido
  iniciado_em timestamptz,
  concluido_em timestamptz
);

alter table tickets enable row level security;

create policy "tickets_select" on tickets for select using (true);
create policy "tickets_insert" on tickets for insert with check (true);
create policy "tickets_update" on tickets for update using (true);

-- ═══════════════════════════════════════════════
-- TABELA ALL HANDS · perguntas do time + tema do gestor
-- Rode no Supabase: SQL Editor → New query
-- Projeto: feydpbqdsekolowcxska
-- ═══════════════════════════════════════════════

create table if not exists allhands (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  tipo text not null default 'pergunta',   -- 'pergunta' (time) | 'tema' (gestor)
  texto text not null,                      -- a pergunta, ou o tema enviado pelo gestor
  autor text                                -- nome de quem enviou; null = anônimo
);

alter table allhands enable row level security;
create policy "allhands_select" on allhands for select using (true);
create policy "allhands_insert" on allhands for insert with check (true);
create policy "allhands_update" on allhands for update using (true);
create policy "allhands_delete" on allhands for delete using (true);

-- tema inicial (o gestor troca depois pelo painel)
insert into allhands (tipo, texto) values
  ('tema', 'Mande sua pergunta para o próximo All Hands 👇');

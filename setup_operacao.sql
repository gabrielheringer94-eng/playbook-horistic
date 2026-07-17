-- ═══════════════════════════════════════════════
-- TABELA DE OPERAÇÃO · resultados da consultoria
-- Rode no Supabase: SQL Editor → New query → Run
-- ═══════════════════════════════════════════════

create table if not exists operacao (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  semana text not null,
  leads int default 0,
  conversas int default 0,
  propostas int default 0,
  vendas int default 0,
  receita numeric default 0
);

alter table operacao enable row level security;
create policy "operacao_select" on operacao for select using (true);
create policy "operacao_insert" on operacao for insert with check (true);
create policy "operacao_update" on operacao for update using (true);
create policy "operacao_delete" on operacao for delete using (true);

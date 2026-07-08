-- ═══════════════════════════════════════════════
-- TABELA DE ATIVIDADES · rastreamento de uso
-- Rode no Supabase: SQL Editor → New query
-- Projeto: feydpbqdsekolowcxska
-- ═══════════════════════════════════════════════

create table if not exists atividades (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  usuario text not null,           -- nome de quem fez a ação
  tipo text not null,              -- acesso | conteudo | treino | roleplay | pagina
  detalhe text,                    -- ex: "BANT", "Simulador Rafael", "Funil interativo"
  valor int                        -- opcional: score do treino/roleplay
);

alter table atividades enable row level security;
create policy "atividades_select" on atividades for select using (true);
create policy "atividades_insert" on atividades for insert with check (true);

-- Índice para consultas por usuário e período
create index if not exists idx_atividades_usuario on atividades(usuario);
create index if not exists idx_atividades_tipo on atividades(tipo);
create index if not exists idx_atividades_data on atividades(created_at);

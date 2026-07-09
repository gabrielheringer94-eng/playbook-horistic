-- ═══════════════════════════════════════════════
-- TABELA ROLEPLAY_SCORES · placar público dos role plays
-- Rode no Supabase: SQL Editor → New query
-- Projeto: feydpbqdsekolowcxska
-- ═══════════════════════════════════════════════

create table if not exists roleplay_scores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  closer text not null,        -- quem fez o papel de closer (avaliado)
  pack text,                   -- Pack 01 / 02 / 03
  score int not null,          -- total (0–60)
  max int default 60,          -- máximo possível
  pct int,                     -- 0–100
  comentario text              -- comentário livre do avaliador (opcional)
);

alter table roleplay_scores enable row level security;
create policy "rp_scores_select" on roleplay_scores for select using (true);
create policy "rp_scores_insert" on roleplay_scores for insert with check (true);
create policy "rp_scores_delete" on roleplay_scores for delete using (true);

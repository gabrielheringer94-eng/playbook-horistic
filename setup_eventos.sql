-- ═══════════════════════════════════════════════
-- TABELA DE EVENTOS · calendário de lançamentos editável
-- Rode no Supabase: SQL Editor → New query
-- Projeto: feydpbqdsekolowcxska
-- ═══════════════════════════════════════════════

create table if not exists eventos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  data date not null,              -- 2026-07-02
  titulo text not null,            -- "Lançamento Estratégias"
  tipo text not null,              -- lancamento | prevenda | evento
  detalhe text,                    -- descrição longa (opcional)
  hora text,                       -- "19h" (opcional)
  ordem int default 0
);

alter table eventos enable row level security;
create policy "eventos_select" on eventos for select using (true);
create policy "eventos_insert" on eventos for insert with check (true);
create policy "eventos_update" on eventos for update using (true);
create policy "eventos_delete" on eventos for delete using (true);

-- ─── SEED: eventos atuais do calendário (jul–ago 2026) ───
insert into eventos (data, titulo, tipo, detalhe, hora) values
('2026-07-02','Lançamento Estratégias','lancamento','Lançamento oficial do produto "Estratégias de Trading" com opção de lives do Leo no Youtube.','19h'),
('2026-07-07','Orderbump Radar','lancamento','Oferta de orderbump do Radar de Trade.',null),
('2026-07-09','Pico VIP','prevenda','Pico de captação para o Remindset VIP.',null),
('2026-07-14','Orderbump Radar','lancamento','Oferta de orderbump do Radar de Trade.',null),
('2026-07-16','Orderbump C&V','lancamento','Orderbump Compra e Venda.',null),
('2026-07-21','Orderbump Radar','lancamento','Oferta de orderbump do Radar de Trade.',null),
('2026-07-23','Orderbump C&V','lancamento','Orderbump Compra e Venda.',null),
('2026-07-28','Orderbump Radar','lancamento','Oferta de orderbump do Radar de Trade.',null),
('2026-07-28','Live 01 Imersão','evento','Primeira live da imersão.',null),
('2026-07-30','Live Vendas Desafio','lancamento','Live de vendas do Desafio Trader.',null),
('2026-08-03','Fechamento Desafio Trader','evento','Fechamento do Desafio Trader.',null);

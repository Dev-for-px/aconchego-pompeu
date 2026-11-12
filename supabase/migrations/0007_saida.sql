-- Aviso "Já vai?" (intenção de saída) configurável no painel
alter table public.configuracoes add column if not exists saida jsonb not null default '{}'::jsonb;
select 'ok' as resultado;

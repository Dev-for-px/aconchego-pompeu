-- Menu do site (topo e menu do celular) editável no painel em Ajustes › Menu do site.
-- Lista de { rotulo, href, ativo }. Vazio = site usa o menu padrão (src/lib/menu.ts).
alter table public.configuracoes add column if not exists menu jsonb not null default '[]'::jsonb;
select 'ok' as resultado;

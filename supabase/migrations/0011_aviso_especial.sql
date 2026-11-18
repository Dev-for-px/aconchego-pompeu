-- Texto do aviso dos itens com estrela no "Monte seu marmitex" (editável em Almoço › Preços do marmitex).
-- Vazio = texto padrão (AVISO_ESPECIAL_PADRAO em src/lib/marmitex.ts). {preco} vira o preço especial.
alter table public.configuracoes add column if not exists aviso_especial text check (length(aviso_especial) <= 300);
select 'ok' as resultado;

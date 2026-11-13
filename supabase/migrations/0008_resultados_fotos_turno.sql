-- Métricas completas (qualquer clique) + turno das fotos da galeria
alter table public.eventos drop constraint if exists eventos_tipo_check;
alter table public.eventos add column if not exists rotulo text;   -- detalhe: nome do produto, rede, termo buscado, botão
alter table public.eventos add column if not exists pagina text;   -- página onde aconteceu
alter table public.eventos add column if not exists sessao text;   -- visita anônima (para contar pessoas, não identifica ninguém)
create index if not exists eventos_criado_em_idx on public.eventos (criado_em desc);
-- limita tamanho dos textos enviados pelo navegador
alter table public.eventos drop constraint if exists eventos_tamanhos;
alter table public.eventos add constraint eventos_tamanhos check (length(tipo) <= 40 and coalesce(length(rotulo),0) <= 120 and coalesce(length(pagina),0) <= 200 and coalesce(length(sessao),0) <= 40);

alter table public.galeria add column if not exists turno public.turno not null default 'ambos';
select 'ok' as resultado;

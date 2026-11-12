-- =====================================================================
-- Aconchego – Etapa 2: estrutura do banco, permissões (RLS) e equipe
-- =====================================================================

-- ---------- Tipos ----------
create type public.perfil_equipe as enum ('dono', 'gerente', 'social', 'atendente');
create type public.turno as enum ('almoco', 'noite', 'ambos');

-- ---------- Equipe ----------
-- Cada membro é um usuário do Supabase Auth. O login aceita telefone, e-mail
-- ou nome de usuário: o sistema descobre o e-mail de login (real ou interno).
create table public.equipe (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null,
  telefone    text unique,          -- só dígitos, ex.: 5537999943111
  usuario     text unique,          -- minúsculo, ex.: maria
  email       text unique,          -- e-mail real (opcional)
  email_login text not null unique, -- e-mail usado no Auth (real ou interno)
  perfil      public.perfil_equipe not null default 'atendente',
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

-- Funções auxiliares de permissão (security definer = leem a tabela sem RLS)
create or replace function public.meu_perfil()
returns public.perfil_equipe
language sql stable security definer set search_path = public as $$
  select perfil from public.equipe where id = auth.uid() and ativo
$$;

create or replace function public.tem_perfil(perfis public.perfil_equipe[])
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_perfil() = any (perfis), false)
$$;

-- Usada na tela de login: recebe telefone/usuário/e-mail e devolve o e-mail de login.
create or replace function public.email_para_login(identificador text)
returns text
language sql stable security definer set search_path = public as $$
  with entrada as (
    select lower(trim(identificador)) as txt,
           regexp_replace(identificador, '\D', '', 'g') as digitos
  )
  select e.email_login
  from public.equipe e, entrada
  where e.ativo and (
       e.email = entrada.txt
    or e.usuario = entrada.txt
    or (length(entrada.digitos) >= 10 and (
         e.telefone = entrada.digitos
      or e.telefone = '55' || entrada.digitos))
  )
  limit 1
$$;
grant execute on function public.email_para_login(text) to anon, authenticated;

-- ---------- Configurações gerais (linha única) ----------
create table public.configuracoes (
  id                   int primary key default 1 check (id = 1),
  mostrar_precos       boolean not null default false, -- briefing: não mostrar preços
  pedidos_pausados     boolean not null default false,
  whatsapp             text not null default '5537999943111',
  telefone             text not null default '553735233111',
  taxa_entrega         numeric(10,2),
  pedido_minimo        numeric(10,2),
  horarios             jsonb not null default '{}'::jsonb,
  redes                jsonb not null default '{}'::jsonb,
  formas_pagamento     text[] not null default array['Dinheiro','Pix','Cartão de débito','Cartão de crédito','Vale-refeição'],
  historia             text,
  seo                  jsonb not null default '{}'::jsonb,
  analytics            jsonb not null default '{}'::jsonb,
  atualizado_em        timestamptz not null default now()
);

-- ---------- Cardápio fixo (noite e itens fixos do dia) ----------
create table public.categorias (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  slug      text not null unique,
  descricao text,
  turno     public.turno not null default 'noite',
  ordem     int not null default 0,
  ativo     boolean not null default true
);

create table public.produtos (
  id              uuid primary key default gen_random_uuid(),
  categoria_id    uuid not null references public.categorias (id) on delete cascade,
  nome            text not null,
  slug            text not null unique,
  descricao       text,
  preco           numeric(10,2),          -- opcional
  foto_url        text,                   -- opcional
  foto_alt        text,
  tags            text[] not null default '{}',
  disponivel      boolean not null default true,
  destaque        boolean not null default false,
  meio_a_meio     boolean not null default false,
  ordem           int not null default 0,
  atualizado_em   timestamptz not null default now()
);
create index on public.produtos (categoria_id, ordem);

create table public.adicionais (
  id         uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  nome       text not null,
  preco      numeric(10,2),
  ordem      int not null default 0
);

create table public.promocoes (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  descricao   text,
  preco       numeric(10,2),
  foto_url    text,
  valido_de   date,
  valido_ate  date,
  ativo       boolean not null default true
);

-- ---------- Cardápio do almoço (muda todo dia) ----------
create table public.cardapio_almoco (
  id              uuid primary key default gen_random_uuid(),
  data            date not null unique,
  texto_original  text not null,          -- texto colado do WhatsApp
  itens           jsonb not null default '[]'::jsonb, -- [{secao, itens:[{nome, preco}]}]
  publicado       boolean not null default false,
  publicado_por   uuid references public.equipe (id) on delete set null,
  atualizado_em   timestamptz not null default now()
);

-- ---------- Conteúdo ----------
create table public.faq (
  id       uuid primary key default gen_random_uuid(),
  pergunta text not null,
  resposta text not null,
  ordem    int not null default 0,
  ativo    boolean not null default true
);

create table public.avaliacoes (
  id      uuid primary key default gen_random_uuid(),
  autor   text not null,
  nota    int not null check (nota between 1 and 5),
  texto   text,
  data    date,
  ativo   boolean not null default true
);

create table public.galeria (
  id      uuid primary key default gen_random_uuid(),
  url     text not null,
  legenda text,
  ordem   int not null default 0,
  ativo   boolean not null default true
);

-- ---------- Métricas simples ----------
create table public.eventos (
  id         bigint generated always as identity primary key,
  tipo       text not null check (tipo in ('enviar_pedido','add_carrinho','clique_whatsapp','clique_ligar')),
  produto_id uuid references public.produtos (id) on delete set null,
  criado_em  timestamptz not null default now()
);

-- ---------- Histórico (quem alterou o quê) ----------
create table public.historico (
  id          bigint generated always as identity primary key,
  membro_id   uuid references public.equipe (id) on delete set null,
  tabela      text not null,
  acao        text not null,
  registro_id text,
  criado_em   timestamptz not null default now()
);

create or replace function public.registrar_historico()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.historico (membro_id, tabela, acao, registro_id)
  values (auth.uid(), tg_table_name, lower(tg_op),
          coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'id', ''));
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['configuracoes','categorias','produtos','adicionais','promocoes',
                           'cardapio_almoco','faq','avaliacoes','galeria','equipe']
  loop
    execute format('create trigger historico_%1$s after insert or update or delete on public.%1$s
                    for each row execute function public.registrar_historico()', t);
  end loop;
end $$;

-- =====================================================================
-- RLS – quem pode ler e escrever
-- =====================================================================
alter table public.equipe          enable row level security;
alter table public.configuracoes   enable row level security;
alter table public.categorias      enable row level security;
alter table public.produtos        enable row level security;
alter table public.adicionais      enable row level security;
alter table public.promocoes       enable row level security;
alter table public.cardapio_almoco enable row level security;
alter table public.faq             enable row level security;
alter table public.avaliacoes      enable row level security;
alter table public.galeria         enable row level security;
alter table public.eventos         enable row level security;
alter table public.historico       enable row level security;

-- Equipe: cada um vê a si mesmo; dono vê e gerencia todos
create policy equipe_ler on public.equipe for select
  using (id = auth.uid() or public.tem_perfil('{dono}'));
create policy equipe_dono on public.equipe for all
  using (public.tem_perfil('{dono}')) with check (public.tem_perfil('{dono}'));

-- Configurações: público lê; dono/gerente editam; atendente pode pausar pedidos (via app)
create policy config_ler on public.configuracoes for select using (true);
create policy config_editar on public.configuracoes for update
  using (public.tem_perfil('{dono,gerente,atendente}'))
  with check (public.tem_perfil('{dono,gerente,atendente}'));

-- Cardápio fixo: público lê o que está ativo; equipe lê tudo
create policy cat_ler on public.categorias for select
  using (ativo or public.meu_perfil() is not null);
create policy cat_editar on public.categorias for all
  using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));

create policy prod_ler on public.produtos for select using (true);
create policy prod_editar on public.produtos for all
  using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));
-- Atendente só liga/desliga "disponível" (o app envia apenas esse campo)
create policy prod_disponivel on public.produtos for update
  using (public.tem_perfil('{atendente}')) with check (public.tem_perfil('{atendente}'));

create policy adic_ler on public.adicionais for select using (true);
create policy adic_editar on public.adicionais for all
  using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));

create policy promo_ler on public.promocoes for select
  using (ativo or public.meu_perfil() is not null);
create policy promo_editar on public.promocoes for all
  using (public.tem_perfil('{dono,gerente,social}')) with check (public.tem_perfil('{dono,gerente,social}'));

-- Almoço: público lê só o publicado; dono/gerente/social editam
create policy almoco_ler on public.cardapio_almoco for select
  using (publicado or public.meu_perfil() is not null);
create policy almoco_editar on public.cardapio_almoco for all
  using (public.tem_perfil('{dono,gerente,social}')) with check (public.tem_perfil('{dono,gerente,social}'));

-- Conteúdo
create policy faq_ler on public.faq for select using (ativo or public.meu_perfil() is not null);
create policy faq_editar on public.faq for all
  using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));

create policy aval_ler on public.avaliacoes for select using (ativo or public.meu_perfil() is not null);
create policy aval_editar on public.avaliacoes for all
  using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));

create policy gal_ler on public.galeria for select using (ativo or public.meu_perfil() is not null);
create policy gal_editar on public.galeria for all
  using (public.tem_perfil('{dono,gerente,social}')) with check (public.tem_perfil('{dono,gerente,social}'));

-- Eventos: qualquer visitante registra; só equipe lê
create policy eventos_inserir on public.eventos for insert with check (true);
create policy eventos_ler on public.eventos for select using (public.tem_perfil('{dono,gerente}'));

-- Histórico: só dono lê
create policy historico_ler on public.historico for select using (public.tem_perfil('{dono}'));

-- =====================================================================
-- Storage: fotos (leitura pública, upload pela equipe)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
  on conflict (id) do nothing;

create policy fotos_ler on storage.objects for select using (bucket_id = 'fotos');
create policy fotos_enviar on storage.objects for insert
  with check (bucket_id = 'fotos' and public.tem_perfil('{dono,gerente,social}'));
create policy fotos_alterar on storage.objects for update
  using (bucket_id = 'fotos' and public.tem_perfil('{dono,gerente,social}'));
create policy fotos_apagar on storage.objects for delete
  using (bucket_id = 'fotos' and public.tem_perfil('{dono,gerente,social}'));

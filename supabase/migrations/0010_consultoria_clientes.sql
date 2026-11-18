-- =====================================================================
-- Aconchego – v1.2: consultoria protegida, FAQ travado, clientes e pedidos, conta de cliente
-- =====================================================================

-- ---------- Consultoria (PHAR: Pedro e José Rufino) ----------
-- Quem é consultoria não pode ser removido, bloqueado, rebaixado nem ter a senha trocada
-- por outra pessoa da equipe. Também são os únicos que editam as perguntas frequentes (SEO).
alter table public.equipe add column if not exists consultoria boolean not null default false;
update public.equipe set consultoria = true where usuario in ('pedroribeiro', 'joserufino');

create or replace function public.sou_consultoria()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select consultoria from public.equipe where id = auth.uid() and ativo), false)
$$;
grant execute on function public.sou_consultoria() to authenticated;

-- Trava na própria tabela (vale para o painel, para as funções e para qualquer chamada direta).
-- Na tela de SQL do Supabase (administrador, sem usuário logado) tudo continua liberado.
create or replace function public.proteger_consultoria()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_admin boolean := auth.uid() is null;
begin
  if v_admin then return coalesce(new, old); end if;
  if tg_op = 'INSERT' then
    if new.consultoria then raise exception 'Só a consultoria pode marcar alguém como consultoria'; end if;
    return new;
  end if;
  if tg_op = 'UPDATE' and new.consultoria is distinct from old.consultoria then
    raise exception 'Só a consultoria pode marcar alguém como consultoria';
  end if;
  if old.consultoria and not public.sou_consultoria() then
    raise exception 'Esta pessoa é da consultoria (PHAR) e não pode ser alterada ou removida';
  end if;
  return coalesce(new, old);
end $$;
drop trigger if exists equipe_proteger_consultoria on public.equipe;
create trigger equipe_proteger_consultoria before update or delete or insert on public.equipe
  for each row execute function public.proteger_consultoria();

-- Usuário agora é obrigatório; telefone e e-mail são opcionais.
create or replace function public.criar_membro(
  p_nome text, p_senha text, p_perfil public.perfil_equipe,
  p_telefone text default null, p_usuario text default null, p_email text default null
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_id uuid := gen_random_uuid();
  v_tel text := nullif(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g'), '');
  v_usuario text := nullif(lower(trim(coalesce(p_usuario, ''))), '');
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_login text;
  v_admin boolean := auth.uid() is null and session_user <> 'authenticator';
begin
  if not v_admin and exists (select 1 from equipe where perfil = 'dono' and ativo) and not tem_perfil('{dono}') then
    raise exception 'Só o dono pode cadastrar pessoas na equipe';
  end if;
  if coalesce(trim(p_nome), '') = '' then raise exception 'Informe o nome'; end if;
  if v_usuario is null then raise exception 'Informe o nome de usuário'; end if;
  if v_usuario !~ '^[a-z0-9._]{3,30}$' then
    raise exception 'O usuário deve ter de 3 a 30 letras ou números, sem espaço nem acento (pode usar ponto)';
  end if;
  if exists (select 1 from equipe where usuario = v_usuario) then raise exception 'Este usuário já existe'; end if;
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  if v_tel is not null and length(v_tel) in (10, 11) then v_tel := '55' || v_tel; end if;
  if v_tel is not null and exists (select 1 from equipe where telefone = v_tel) then raise exception 'Este telefone já está na equipe'; end if;
  if v_email is not null and exists (select 1 from equipe where email = v_email) then raise exception 'Este e-mail já está na equipe'; end if;

  v_login := coalesce(v_email, 'u-' || replace(v_id::text, '-', '') || '@equipe.aconchego.app');

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_login,
          crypt(p_senha, gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}', jsonb_build_object('nome', p_nome), now(), now(),
          '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_login, 'email_verified', true),
          'email', now(), now(), now());
  insert into equipe (id, nome, telefone, usuario, email, email_login, perfil)
  values (v_id, trim(p_nome), v_tel, v_usuario, v_email, v_login, p_perfil);
  return v_id;
end $$;

create or replace function public.redefinir_senha(p_id uuid, p_senha text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not (tem_perfil('{dono}') or p_id = auth.uid()) then raise exception 'Sem permissão'; end if;
  if p_id <> auth.uid() and not sou_consultoria() and exists (select 1 from equipe where id = p_id and consultoria) then
    raise exception 'A senha da consultoria (PHAR) só pode ser trocada por ela mesma';
  end if;
  if not exists (select 1 from equipe where id = p_id) then raise exception 'Pessoa não encontrada na equipe'; end if;
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  update auth.users set encrypted_password = crypt(p_senha, gen_salt('bf')), updated_at = now() where id = p_id;
end $$;

-- Remover de vez (o histórico continua, sem o nome). Consultoria é protegida pelo gatilho acima.
create or replace function public.remover_membro(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not tem_perfil('{dono}') then raise exception 'Só o dono pode remover pessoas'; end if;
  if p_id = auth.uid() then raise exception 'Você não pode remover a si mesmo'; end if;
  if exists (select 1 from equipe where id = p_id and consultoria) and not sou_consultoria() then
    raise exception 'Esta pessoa é da consultoria (PHAR) e não pode ser removida';
  end if;
  delete from equipe where id = p_id;
  delete from auth.users where id = p_id;
end $$;
revoke all on function public.remover_membro(uuid) from public, anon;
grant execute on function public.remover_membro(uuid) to authenticated;

-- ---------- Perguntas frequentes: só a consultoria edita ----------
drop policy if exists faq_editar on public.faq;
create policy faq_editar on public.faq for all
  using (public.sou_consultoria()) with check (public.sou_consultoria());

-- ---------- Clientes e pedidos ----------
alter table public.configuracoes add column if not exists clientes_cadastro boolean not null default false;

create table if not exists public.clientes (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null check (length(nome) <= 80),
  telefone         text unique check (telefone ~ '^[0-9]{10,13}$'),
  endereco         text check (length(endereco) <= 200),
  referencia       text check (length(referencia) <= 120),
  conta_id         uuid unique references auth.users (id) on delete set null,
  total_pedidos    integer not null default 0,
  ultimo_pedido_em timestamptz,
  criado_em        timestamptz not null default now()
);

create table if not exists public.pedidos (
  id         bigint generated always as identity primary key,
  cliente_id uuid references public.clientes (id) on delete cascade,
  nome       text not null,
  telefone   text,
  tipo       text not null check (tipo in ('entrega', 'retirada', 'mesa')),
  endereco   text,
  pagamento  text,
  itens      jsonb not null default '[]'::jsonb check (pg_column_size(itens) < 20000),
  total      numeric(10, 2),
  criado_em  timestamptz not null default now()
);
create index if not exists pedidos_cliente_idx on public.pedidos (cliente_id, criado_em desc);
create index if not exists pedidos_data_idx on public.pedidos (criado_em desc);

alter table public.clientes enable row level security;
alter table public.pedidos  enable row level security;
create policy clientes_equipe on public.clientes for select using (public.tem_perfil('{dono,gerente}') or conta_id = auth.uid());
create policy clientes_apagar on public.clientes for delete using (public.tem_perfil('{dono}'));
create policy pedidos_equipe on public.pedidos for select using (
  public.tem_perfil('{dono,gerente}') or cliente_id in (select id from public.clientes where conta_id = auth.uid()));

-- Chamado pelo site ao enviar o pedido (qualquer visitante). Guarda/atualiza o cliente pelo telefone
-- (ou pela conta, se estiver logado) e registra o pedido. Limite simples contra abuso.
create or replace function public.registrar_pedido(
  p_nome text, p_telefone text, p_tipo text, p_endereco text, p_referencia text,
  p_pagamento text, p_itens jsonb, p_total numeric
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_tel text := nullif(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g'), '');
  v_nome text := left(trim(coalesce(p_nome, '')), 80);
  v_end text := nullif(left(trim(coalesce(p_endereco, '')), 200), '');
  v_ref text := nullif(left(trim(coalesce(p_referencia, '')), 120), '');
  v_cliente uuid;
begin
  if v_nome = '' then return; end if;
  if v_tel is not null and length(v_tel) in (10, 11) then v_tel := '55' || v_tel; end if;
  if v_tel is not null and v_tel !~ '^[0-9]{12,13}$' then v_tel := null; end if;
  if (select count(*) from pedidos where criado_em > now() - interval '10 minutes') > 60 then return; end if;

  -- Conta logada (cliente) tem prioridade; senão, o telefone.
  select id into v_cliente from clientes where conta_id = auth.uid() and auth.uid() is not null;
  if v_cliente is null and v_tel is not null then select id into v_cliente from clientes where telefone = v_tel; end if;

  if v_cliente is null and v_tel is not null then
    insert into clientes (nome, telefone, endereco, referencia) values (v_nome, v_tel, v_end, v_ref) returning id into v_cliente;
  elsif v_cliente is not null then
    update clientes set nome = v_nome,
      telefone = coalesce(telefone, v_tel),
      endereco = case when p_tipo = 'entrega' then coalesce(v_end, endereco) else endereco end,
      referencia = case when p_tipo = 'entrega' then coalesce(v_ref, referencia) else referencia end
    where id = v_cliente;
  end if;
  if v_cliente is not null then
    update clientes set total_pedidos = total_pedidos + 1, ultimo_pedido_em = now() where id = v_cliente;
  end if;

  insert into pedidos (cliente_id, nome, telefone, tipo, endereco, pagamento, itens, total)
  values (v_cliente, v_nome, v_tel, case when p_tipo in ('entrega','retirada','mesa') then p_tipo else 'entrega' end,
          case when p_tipo = 'entrega' then v_end end, left(p_pagamento, 40),
          case when jsonb_typeof(p_itens) = 'array' and pg_column_size(p_itens) < 20000 then p_itens else '[]'::jsonb end,
          p_total);
end $$;
revoke all on function public.registrar_pedido(text, text, text, text, text, text, jsonb, numeric) from public;
grant execute on function public.registrar_pedido(text, text, text, text, text, text, jsonb, numeric) to anon, authenticated;

-- ---------- Conta de cliente (opcional, ligada/desligada no painel) ----------
-- Entra com telefone + senha. O e-mail de login é interno: c-<telefone>@clientes.aconchego.app
create or replace function public.criar_conta_cliente(p_nome text, p_telefone text, p_senha text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  v_tel text := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  v_id uuid := gen_random_uuid();
  v_login text;
  v_cliente uuid;
begin
  if not (select clientes_cadastro from configuracoes where id = 1) then raise exception 'Cadastro de clientes desligado'; end if;
  if coalesce(trim(p_nome), '') = '' then raise exception 'Informe o nome'; end if;
  if length(v_tel) in (10, 11) then v_tel := '55' || v_tel; end if;
  if v_tel !~ '^55[0-9]{10,11}$' then raise exception 'Telefone inválido'; end if;
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  v_login := 'c-' || v_tel || '@clientes.aconchego.app';
  if exists (select 1 from auth.users where email = v_login) then raise exception 'Já existe uma conta com este telefone'; end if;
  if (select count(*) from auth.users where email like '%@clientes.aconchego.app' and created_at > now() - interval '10 minutes') > 30 then
    raise exception 'Muitos cadastros agora. Tente de novo em alguns minutos';
  end if;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_login,
          crypt(p_senha, gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"],"tipo":"cliente"}', jsonb_build_object('nome', trim(p_nome)), now(), now(),
          '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_login, 'email_verified', true),
          'email', now(), now(), now());

  select id into v_cliente from clientes where telefone = v_tel;
  if v_cliente is null then
    insert into clientes (nome, telefone, conta_id) values (left(trim(p_nome), 80), v_tel, v_id);
  else
    update clientes set conta_id = v_id where id = v_cliente;
  end if;
end $$;
revoke all on function public.criar_conta_cliente(text, text, text) from public;
grant execute on function public.criar_conta_cliente(text, text, text) to anon, authenticated;

-- Cliente logado atualiza os próprios dados.
create or replace function public.atualizar_meus_dados(p_nome text, p_endereco text, p_referencia text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  update clientes set nome = left(trim(p_nome), 80),
    endereco = nullif(left(trim(coalesce(p_endereco, '')), 200), ''),
    referencia = nullif(left(trim(coalesce(p_referencia, '')), 120), '')
  where conta_id = auth.uid() and coalesce(trim(p_nome), '') <> '';
end $$;
revoke all on function public.atualizar_meus_dados(text, text, text) from public, anon;
grant execute on function public.atualizar_meus_dados(text, text, text) to authenticated;

-- Dono/gerente troca a senha de um cliente que esqueceu (atendimento pelo WhatsApp).
create or replace function public.redefinir_senha_cliente(p_cliente uuid, p_senha text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_conta uuid;
begin
  if not tem_perfil('{dono,gerente}') then raise exception 'Sem permissão'; end if;
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  select conta_id into v_conta from clientes where id = p_cliente;
  if v_conta is null then raise exception 'Este cliente não tem conta no site'; end if;
  update auth.users set encrypted_password = crypt(p_senha, gen_salt('bf')), updated_at = now() where id = v_conta;
end $$;
revoke all on function public.redefinir_senha_cliente(uuid, text) from public, anon;
grant execute on function public.redefinir_senha_cliente(uuid, text) to authenticated;

-- Apagar cliente também apaga a conta dele (LGPD: pedido de exclusão).
create or replace function public.apagar_cliente(p_cliente uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_conta uuid;
begin
  if not tem_perfil('{dono}') then raise exception 'Só o dono pode apagar clientes'; end if;
  select conta_id into v_conta from clientes where id = p_cliente;
  delete from clientes where id = p_cliente;
  if v_conta is not null and not exists (select 1 from equipe where id = v_conta) then delete from auth.users where id = v_conta; end if;
end $$;
revoke all on function public.apagar_cliente(uuid) from public, anon;
grant execute on function public.apagar_cliente(uuid) to authenticated;

select 'ok' as resultado;

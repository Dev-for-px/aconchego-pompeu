-- Aconchego – criar e gerenciar logins da equipe sem chave secreta.
-- Funções "security definer": rodam com permissão do banco, mas só o Dono consegue chamar
-- (ou qualquer pessoa logada enquanto ainda não existe nenhum Dono — para criar o primeiro).

create extension if not exists pgcrypto with schema extensions;

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
  -- Na tela de SQL do Supabase (administrador) não há usuário logado: pode cadastrar sempre.
  v_admin boolean := auth.uid() is null and session_user <> 'authenticator';
begin
  if not v_admin and exists (select 1 from equipe where perfil = 'dono' and ativo) and not tem_perfil('{dono}') then
    raise exception 'Só o dono pode cadastrar pessoas na equipe';
  end if;
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  if v_tel is null and v_usuario is null and v_email is null then raise exception 'Informe telefone, usuário ou e-mail'; end if;
  if v_tel is not null and length(v_tel) in (10, 11) then v_tel := '55' || v_tel; end if;

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
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  update auth.users set encrypted_password = crypt(p_senha, gen_salt('bf')), updated_at = now() where id = p_id;
end $$;

-- Desativar acesso também derruba o login (ban) e reativar libera.
create or replace function public.definir_ativo(p_id uuid, p_ativo boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not tem_perfil('{dono}') then raise exception 'Sem permissão'; end if;
  if p_id = auth.uid() and not p_ativo then raise exception 'Você não pode desativar a si mesmo'; end if;
  update equipe set ativo = p_ativo where id = p_id;
  update auth.users set banned_until = case when p_ativo then null else 'infinity'::timestamptz end where id = p_id;
end $$;

revoke all on function public.criar_membro(text, text, public.perfil_equipe, text, text, text) from public, anon;
revoke all on function public.redefinir_senha(uuid, text) from public, anon;
revoke all on function public.definir_ativo(uuid, boolean) from public, anon;
grant execute on function public.criar_membro(text, text, public.perfil_equipe, text, text, text) to authenticated;
grant execute on function public.redefinir_senha(uuid, text) to authenticated;
grant execute on function public.definir_ativo(uuid, boolean) to authenticated;

-- Primeiro Dono: criado direto aqui no SQL Editor (que roda como administrador).
-- select public.criar_membro('Nome da Dona', 'SENHA-INICIAL', 'dono', '37 9XXXX-XXXX');

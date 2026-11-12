@AGENTS.md

# Projeto: site do Restaurante e Pizzaria Aconchego (Pompéu – MG)

Leia `docs/escopo-site.md` (escopo completo) e `docs/pesquisa-seo.md` (palavras-chave, NAP, FAQ, schema) antes de qualquer tarefa.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (`@supabase/ssr`)
- Hospedagem atual: Vercel (deploy automático a cada push na `main`)
- Supabase: projeto `yfjdwxdqhvggsibigqif` (região São Paulo); variáveis em `.env.local` (modelo em `.env.example`)

## Regras
- **Código portátil**: nada exclusivo da Vercel (sem Edge Config, KV, Blob etc.) — vamos migrar para VPS (Coolify) depois
- **SEO/GEO em primeiro lugar**: HTML semântico, um H1 por página, JSON-LD, metadados, `sitemap.xml`, `robots.txt`, `llms.txt`
- NAP sempre idêntico ao de `docs/pesquisa-seo.md`; escrever "Pompéu – MG" com acento
- Texto do site em português do Brasil; público leigo — interface simples, botões grandes
- Preço e foto de produto são **opcionais**: o layout deve ficar bonito sem eles
- Nunca commitar `.env*` nem chaves `service_role`
- O dono do projeto (Pedro) está aprendendo: explique cada etapa em linguagem simples

## Etapas
1. [x] Setup do projeto + conexão com Supabase
2. [x] Banco: tabelas, RLS e perfis de equipe
3. [x] Site público: home, cardápio da noite, almoço do dia, FAQ, SEO técnico
4. [x] Carrinho → WhatsApp
5. [x] Painel admin: login (telefone/e-mail/usuário), equipe, colar cardápio do almoço

## Design System
- Fonte da verdade: artifact "Aconchego" (Design System) no claude.ai — tokens copiados em `src/app/globals.css` (`@theme`)
- Cores só dos tokens: `vinho-700/800/500`, `creme-50/200`, `ink`, `muted`, `linha`, `dourado` (só fundo de selo), `aberto`, `fechado`
- Fontes: Playfair Display (títulos), Inter (texto/botões), Great Vibes (só frases curtas de destaque)
- Botões/chips `rounded-pill`, cards `rounded-md`, bordas `border-linha`, sem sombras pesadas; ícones Lucide
- Logo oficial é intocável: arquivos em `public/marca/` e ligar `LOGO_DISPONIVEL` em `src/components/Logo.tsx`

## Dados no site
- Leitura pública em `src/lib/dados.ts` com `"use cache"` + `cacheTag` (config, cardapio, almoco, faq, avaliacoes, galeria, promocoes) — o painel deve revalidar essas tags ao salvar
- Almoço: `getAlmocoHoje()` só devolve o cardápio da data de hoje em Pompéu

## Banco (Supabase)
- SQL versionado em `supabase/migrations/` (já aplicado no projeto via SQL Editor)
- Perfis da equipe: `dono`, `gerente`, `social`, `atendente` — permissões via RLS com `tem_perfil()`
- Login por telefone/usuário/e-mail: `email_para_login(identificador)` devolve o e-mail do Auth; quem não tem e-mail recebe um e-mail interno (`email_login`)
- Membros da equipe: funções `criar_membro`, `redefinir_senha`, `definir_ativo` (security definer, só Dono) — sem chave service_role
- Primeiro Dono: rodar `select public.criar_membro(...)` no SQL Editor
- Atendente: a RLS libera update em `produtos`; o app deve enviar só o campo `disponivel`

## Carrinho → WhatsApp
- Estado em `src/lib/carrinho.tsx` (contexto + localStorage: carrinho, último pedido, dados do cliente)
- Mensagem montada em `src/lib/mensagem.ts`; envio abre `wa.me` com o número de `configuracoes.whatsapp`
- Sem preço (`mostrar_precos = false` ou produto sem preço) → "a confirmar"; meio a meio cobra o sabor mais caro
- Celular primeiro: barra "Ver pedido" fixa acima da barra Ligar/WhatsApp; painel de produto sobe de baixo (`Sheet`)

## Painel (/admin)
- Rotas públicas ficam em `src/app/(site)/` (com header/rodapé/carrinho); `/admin` tem layout próprio
- Painel é client-side (`@supabase/ssr` browser client + RLS); ao salvar chama a server action `atualizarSite(tags)` (`updateTag`)
- Telas: Início (atalhos, pausar pedidos, mostrar preços), Almoço (colar texto → `parserAlmoco.ts`), Cardápio, Equipe (só dono), Ajustes (taxa, WhatsApp, história, FAQ)

## Conteúdo, redes e aviso de saída
- Publicações: tabela `posts` → `/novidades` e `/novidades/[slug]` (BlogPosting no schema, sitemap); painel em "Fotos e posts"
- Galeria: tabela `galeria` → faixa de fotos logo abaixo da capa (`GaleriaFaixa`)
- Redes sociais: `configuracoes.redes` (lista em `src/lib/redes.ts`); rodapé mostra só as com link; entram no `sameAs`
- Aviso "Já vai?": `configuracoes.saida` (`src/lib/saida.ts`), intenção de saída (mouse no topo / rolagem rápida pra cima), 1x por visita. Nunca sequestrar o botão Voltar (penalização do Google)
- Links que saem do site abrem em nova aba (`target="_blank" rel="noopener noreferrer"`); pedido abre o WhatsApp em nova aba
- Visual: noite = "Pizzaria" (pizzaria e choperia); "bar" só em SEO (schema/llms/textos discretos)
- Bebidas alcoólicas sempre recolhidas em "Chopp, cervejas e drinks" (`CardapioComBebidas`)

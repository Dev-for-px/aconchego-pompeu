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
2. [ ] Banco: tabelas, RLS e perfis de equipe
3. [ ] Site público: home, cardápio da noite, almoço do dia, FAQ, SEO técnico
4. [ ] Carrinho → WhatsApp
5. [ ] Painel admin: login (telefone/e-mail/usuário), equipe, colar cardápio do almoço

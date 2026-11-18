# Aconchego – Status do projeto (atualizado em 18/11/2026)

**Cliente:** Restaurante, Pizzaria, Choperia e Churrascaria Aconchego – Pompéu – MG (dona: Maria Helena)
**Venda/comercial:** José Rufino (contrato no CNPJ dele: 50.071.862/0001-83). Pedro executa; não entra no contrato.
**Escopo:** site com cardápio, Google Meu Negócio, SEO local, domínio e hospedagem (6 meses de mensalidade)

## Links da cliente
- Google: https://share.google/tJnhbrF08k9Pn71gY
- Instagram: https://www.instagram.com/rest.pizzariaaconchego/
- Cardápio antigo (MenuDino): https://restauranteaconchegopompeu.menudino.com/
- Aiqfome: https://aiqfome.com/MG/pompeu/restaurante-e-pizzaria-aconchego
- Cardápio PDF da casa (Drive): https://drive.google.com/file/d/1nKXleif4fgIOlk1FoaniCh5-1iodEIH4/view
- Linktree: https://linktr.ee/restaurantepizzariaaconchego

## Infra
- Site (provisório): https://aconchego-pompeu.vercel.app
- Código: https://github.com/Dev-for-px/aconchego-pompeu (push na `main` = deploy automático)
- Vercel: https://vercel.com/phar/aconchego-pompeu (Framework Preset = Next.js)
- Supabase: https://supabase.com/dashboard/project/yfjdwxdqhvggsibigqif (região São Paulo)
  - Project URL `https://yfjdwxdqhvggsibigqif.supabase.co`; publishable key em Settings → API
  - Senha do banco e chave service_role NUNCA ficam em documentos
- Stack: Next.js 16 (App Router, cacheComponents) + TypeScript + Tailwind v4 + Supabase
- Design System "Aconchego" (único, unificado em 13/11): https://claude.ai/artifact/F7ec2inkwG1kmS4u1gUZTD — tokens iguais aos do código (`src/app/globals.css`); 5 versões da logo oficial (intocável) + grupo Favicon (prato fumegante da logo sobre vinho, igual a `src/app/icon.png`)
- Apresentação para a cliente (conta nova, 13/11): https://claude.ai/artifact/4hs21ED2JqN1RKCpse8RTW (Slides, 13 slides — atualizar a cada mudança)
- Links antigos (conta anterior) foram substituídos pelos de cima.

## Acessos ao painel (/admin)
- Pedro (usuário `pedroribeiro`), José Rufino (`joserufino`) e Helena (`helenaaconchego`) — todos perfil Dono
- Entram com telefone, usuário ou e-mail. Senhas ficam com cada um (não anotar aqui).

## O que está pronto
- Home enxuta no celular: logo central, H1 "Restaurante e Pizzaria Aconchego – Pompéu, MG", descrição completa discreta, busca, "Pedir agora", status Aberto/Fechado
- Abas Almoço / Pizzaria (abre conforme o horário); fotos dentro das abas (noite após destaques, almoço antes das bebidas)
- Cardápio da noite importado (72 itens + bebidas, tamanhos, meio a meio, bordas/adicionais); categorias recolhíveis; alcoólicas recolhidas em "Chopp, cervejas e drinks"
- Almoço do dia: cola o texto do WhatsApp no painel → publica; sai do ar no horário configurado (padrão 15h30)
- Almoço pelo site = marmitex (16/11): botão "Quero um marmitex" → marca os itens do dia → se marcar churrasco vira "marmitex com churrasco" com preço próprio. Painel Almoço simplificado em 2 passos (1. Cardápio de hoje, 2. Preços do marmitex: normal e com churrasco); o resto fica em "Mais opções"
- Carrinho → WhatsApp (mensagem pronta, entrega/retirada, taxa, "a confirmar" sem preço, chave para esconder todos os preços)
- Painel: Início, Almoço, Cardápio, Fotos e novidades (galeria por turno + posts com rascunho/publicar), Equipe, Ajustes (horários, taxa, WhatsApp, redes, aviso "Já vai?", história, FAQ), Resultados
- Resultados: cliques em WhatsApp/ligar/como chegar/redes, carrinho, pedidos, buscas, páginas; gráficos por dia/hora; "Copiar resumo"
- SEO/GEO: schema (Restaurant, Menu, FAQ, Breadcrumb, BlogPosting), sitemap, robots, llms.txt + llms-full.txt, 16 FAQs completas, favicon/OG
- 5 páginas de SEO local fora do menu: /pizzaria-em-pompeu, /almoco-em-pompeu, /churrascaria-em-pompeu, /choperia-em-pompeu, /delivery-em-pompeu (links só no rodapé discreto, sitemap e llms.txt)
- Rodapé com redes configuráveis e "Desenvolvido por PHAR Consultoria"; links externos em nova aba

- Galeria (17/11): 18 fotos do Instagram da casa (pasta PHAR - IA/02-CLIENTES/aconchego-restaurante-pizzaria/fotos) — 11 do almoço, 6 da noite, chopp nos dois. Ficam em `public/galeria/` (WebP quadrado com moldura creme) e são cadastradas na tabela `galeria`; editar/apagar pelo painel normalmente

- Ajustes de 18/11:
  - Pedido → WhatsApp abre em **nova aba** (link de verdade, sem risco de bloqueio); o site continua aberto
  - **Taxa de entrega** vale para almoço (marmitex) e noite e agora entra no **Total** (checkout e mensagem); aviso da taxa no montador de marmitex
  - **Bebidas**: 3ª aba na home (Almoço | Pizzaria | Bebidas) e página nova `/bebidas` (no sitemap e llms.txt); as abas Almoço/Pizzaria mostram só comida
  - **Menu editável** no painel (Ajustes › Menu do site): renomear, reordenar, esconder, criar link. Padrão: Início, Almoço, Pizzaria, Bebidas, Sobre nós, Dúvidas, Novidades, Como chegar. Coluna `configuracoes.menu` (migration 0009, já aplicada)
  - Almoço: **foguinho virou estrela**. Item com estrela (churrasco, salmão…) deixa o marmitex no **preço especial**; o cliente vê "Seu marmitex com Salmão é especial: passa de R$ 28 para R$ 32". Painel: Almoço › Preços do marmitex › "Preço especial"
  - Aviso **"Já vai?"** revisado: aparece no 1º toque em **Voltar** (o 2º Voltar sai normalmente), quando o mouse sai pelo topo e na rolagem rápida pra cima; 1x por visita, não aparece no carrinho nem depois de enviar o pedido; registra "aviso_saida" nos Resultados

- Versão 1.2.0 (18/11) — histórico completo em `docs/CHANGELOG.md`:
  - Consultoria (Pedro e José) protegida na Equipe; dona pode remover os demais; cadastro com usuário obrigatório, telefone/e-mail opcionais e edição de dados
  - Perguntas frequentes travadas: só a consultoria edita
  - Banco de clientes: todo pedido guarda nome, telefone e endereço + o pedido; tela Clientes no painel (busca, histórico, WhatsApp, planilha, apagar)
  - Conta de cliente opcional (telefone + senha), **desligada** por padrão: ligar em Painel › Clientes
  - Busca inteligente no painel (lupa / Ctrl+K)
  - PWA: instalar no celular (Android e iPhone), tela sem internet
  - Migration 0010 aplicada no Supabase

## Pendências
- [ ] Ano da casa: o site usa **1989** e o slogan "O sabor que acolhe a família de Pompéu desde 1989" (16/11); o briefing dizia fundação em 21/10/2010 — confirmar a história com a Helena/José Carlos e igualar no Google Meu Negócio
- [ ] Conferir no painel (Almoço › Preços do marmitex) os preços reais: hoje Grande R$ 28 / especial R$ 32 e Pequena R$ 24 / especial R$ 28
- [ ] Testar logado no painel: Equipe (remover/editar), Clientes, busca (Ctrl+K) e FAQ travado com o login da Helena
- [ ] Decidir com a Helena se liga a conta de cliente (Painel › Clientes)
- [ ] Acompanhar no Search Console se o aviso no botão Voltar não gera alerta; se gerar, desligar só esse gatilho
- [ ] Desativar "Allow new users to sign up" no Supabase (Authentication → Sign In / Providers)
- [ ] Preencher preços que faltam (~61 itens) e fotos/legendas
- [ ] Conferir com a cliente: preços PDF × Aiqfome, pizzas doces, borda no brotinho, chopp (tamanhos/preços), taxa R$ 4 × R$ 3
- [ ] Preencher campos do contrato e assinar
- [ ] Escolher e registrar domínio (no nome da contratada, transferir no fim) e apontar para o site
- [ ] Google Search Console + Bing; enviar sitemap
- [ ] Solicitar acesso e otimizar o Google Meu Negócio; QR Code de avaliação
- [ ] Depois: migrar hospedagem para VPS (Coolify) junto com outros clientes

# Aconchego – Status do projeto (atualizado em 13/11/2026)

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
- Design System "Aconchego" (conta nova, 13/11): https://claude.ai/artifact/VhYdBXQjBFv4Y9XwnNPZYb — tokens iguais aos do código (`src/app/globals.css`); logo oficial em `public/marca/` (intocável)
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
- Monte sua marmita (só no almoço): tipos de marmitex com preço opcional no painel (Almoço › Tipos de marmitex), cliente escolhe o tipo, marca itens do dia, pode montar várias
- Carrinho → WhatsApp (mensagem pronta, entrega/retirada, taxa, "a confirmar" sem preço, chave para esconder todos os preços)
- Painel: Início, Almoço, Cardápio, Fotos e novidades (galeria por turno + posts com rascunho/publicar), Equipe, Ajustes (horários, taxa, WhatsApp, redes, aviso "Já vai?", história, FAQ), Resultados
- Resultados: cliques em WhatsApp/ligar/como chegar/redes, carrinho, pedidos, buscas, páginas; gráficos por dia/hora; "Copiar resumo"
- SEO/GEO: schema (Restaurant, Menu, FAQ, Breadcrumb, BlogPosting), sitemap, robots, llms.txt + llms-full.txt, 16 FAQs completas, favicon/OG
- 5 páginas de SEO local fora do menu: /pizzaria-em-pompeu, /almoco-em-pompeu, /churrascaria-em-pompeu, /choperia-em-pompeu, /delivery-em-pompeu (links só no rodapé discreto, sitemap e llms.txt)
- Rodapé com redes configuráveis e "Desenvolvido por PHAR Consultoria"; links externos em nova aba

## Pendências
- [ ] Rodar no SQL Editor do Supabase `supabase/migrations/0009_tipos_marmitex.sql` (ou cadastrar os tipos de marmitex pelo painel)
- [ ] Desativar "Allow new users to sign up" no Supabase (Authentication → Sign In / Providers)
- [ ] Preencher preços que faltam (~61 itens) e fotos/legendas
- [ ] Conferir com a cliente: preços PDF × Aiqfome, pizzas doces, borda no brotinho, chopp (tamanhos/preços), taxa R$ 4 × R$ 3
- [ ] Preencher campos do contrato e assinar
- [ ] Escolher e registrar domínio (no nome da contratada, transferir no fim) e apontar para o site
- [ ] Google Search Console + Bing; enviar sitemap
- [ ] Solicitar acesso e otimizar o Google Meu Negócio; QR Code de avaliação
- [ ] Depois: migrar hospedagem para VPS (Coolify) junto com outros clientes

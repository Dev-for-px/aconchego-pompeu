# Escopo do site — Aconchego (rascunho vivo)

_Atualizado em 12/11/2026. Ideias do Pedro sendo consolidadas antes da construção. Pesquisa de SEO completa em `pesquisa-seo.md`._

## 0. Stack (decidido em 12/11/2026)
- **GitHub** (código) + **Vercel** (hospedagem) + **Supabase** (banco, login do admin, fotos)
- Fase de aprovação com a cliente nessa stack; depois avaliar migração para VPS própria (ex.: Hostinger KVM 2 + Coolify) junto com outros clientes
- Código pensado para ser portátil (Next.js padrão, sem recursos exclusivos da Vercel) para facilitar a troca

## 1. Objetivo
- Site-cardápio com foco total em **SEO + GEO** (aparecer em buscas tradicionais e em respostas de IA: ChatGPT, Gemini, Perplexity, AI Overviews).
- Palavras-chave foco: restaurante em Pompéu, pizzaria em Pompéu, choperia em Pompéu, churrascaria em Pompéu, onde jantar em Pompéu.

## 2. Dois turnos, dois "modos" da casa
| Turno | Horário | Posicionamento | Cardápio |
|---|---|---|---|
| **Dia** | 11h–15h (todos os dias) | Restaurante e Churrascaria | **Cardápio do almoço** — muda todo dia |
| **Noite** | 18h–00h (exceto segunda) | Bar, Pizzaria e Choperia | **Cardápio da noite** — fixo (pizzas, porções, chopp, bebidas) |

- O site destaca automaticamente o turno atual (de manhã/almoço mostra o almoço do dia; à tarde/noite mostra a pizzaria), com abas para trocar
- Cada turno com sua página: `/almoco` (ou `/almoco-hoje`) e `/pizzaria` (cardápio da noite)

## 3. Seções do site (página pública)
1. **Hero**: nome, chamada conforme o turno, botões "Ver cardápio" e "Pedir no WhatsApp", status **Aberto agora / Fechado** (automático pelo horário)
2. **Abas Almoço de hoje | Noite (Pizzaria & Choperia)**
3. **Destaques / Mais pedidos** e **Combos e promoções do dia**
4. **Cardápio por categorias**, menu de categorias fixo ao rolar; cada categoria com página própria (/cardapio/pizzas)
5. **Carrinho → WhatsApp**
6. **Nossa história**
7. **Galeria de fotos**
8. **Prova social** (avaliações reais do Google)
9. **FAQ**
10. **Horário de funcionamento** (com feriados/exceções)
11. **Formas de pagamento** (Pix, cartão, dinheiro, vale-refeição)
12. **Localização**: mapa + "Como chegar"
13. **Redes sociais** + link Aiqfome + rodapé com NAP
- **Barra fixa no celular**: Ligar · WhatsApp · Como chegar
- **PWA**: instalar o site como app na tela do celular

## 4. Cardápio do almoço (do dia)
### Como funciona
- Quem cuida do Instagram recebe o cardápio digitado no WhatsApp e **só cola o texto** num campo do painel ("Cardápio do almoço")
- O sistema **lê o texto e monta o cardápio** sozinho: separa títulos/categorias (ex.: "Carnes", "Acompanhamentos"), itens e preços (se houver); ignora emojis e formatação do WhatsApp (*negrito*, _itálico_)
- **Pré-visualização** antes de publicar, com possibilidade de corrigir um item na mão
- Campo **data** (padrão = hoje; dá para deixar o de amanhã agendado na véspera)
- Botão grande **"Publicar cardápio de hoje"**

### Validade
- O cardápio vale **só para a data definida** (expira à meia-noite / 24h)
- No dia seguinte, se ninguém publicou ainda: aviso "O cardápio de hoje sai em instantes — chame no WhatsApp" + botão do WhatsApp (nunca mostrar o cardápio de ontem como se fosse de hoje)
- Histórico dos cardápios antigos guardado no painel (não aparece no site) — dá para "reaproveitar" um cardápio de outro dia

### Pedido
- Itens do almoço podem entrar no carrinho (marmitex/prato) e vão na mensagem do WhatsApp identificados como "Almoço de DD/MM"
- Preço segue a mesma regra de preço opcional

### SEO / GEO do almoço
- Página fixa `/almoco-hoje` (URL não muda; conteúdo muda todo dia) com H1 "Almoço de hoje no Restaurante Aconchego – Pompéu/MG"
- Data visível e `dateModified` atualizado a cada publicação
- Schema `Menu` do dia + texto fixo sobre self-service, marmitex e churrasco no almoço (para ranquear "almoço em Pompéu", "self-service em Pompéu", "churrascaria em Pompéu" mesmo nos dias sem cardápio publicado)
- Entra no `llms.txt` com link para a página do almoço

## 5. Checklist SEO técnico (20 itens)
1. sitemap.xml automático
2. robots.txt (liberando GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
3. Sem noindex em produção
4. URLs canônicas
5. Títulos SEO por página (editáveis no admin)
6. Meta descriptions (editáveis no admin)
7. Um único H1 por página
8. Hierarquia de títulos correta
9. Alt nas imagens (gerado do nome do produto se vazio)
10. JSON-LD: Restaurant/LocalBusiness, Menu/MenuItem, FAQPage, OpeningHoursSpecification, BreadcrumbList
11. Links internos
12. Sem links quebrados
13. Imagens comprimidas/WebP automático no upload
14. Core Web Vitals verdes
15. Responsivo / mobile-first
16. HTTPS
17. Slugs amigáveis
18. Imagem Open Graph
19. Google Search Console + Bing Webmaster
20. llms.txt + llms-full.txt

## 6. Extras GEO
- Bloco "Sobre" com fatos objetivos e citáveis (desde quando, especialidade, Pompéu/MG)
- FAQ no formato de pergunta feita à IA
- NAP idêntico ao Google Meu Negócio
- Data de "última atualização do cardápio" visível
- `sameAs` no schema (Instagram, Facebook, Google, Aiqfome)
- Cardápio em HTML real (nada de imagem/PDF)
- Tags nos pratos (vegetariano, sem lactose, serve 2 pessoas…)
- ~~Bloco "Atendemos em"~~ — removido a pedido do Pedro

## 7. Cardápio da noite (fixo)
- Categorias com ordem definida no admin (Pizzas, Porções na chapa, Petiscos, Chopp, Bebidas, Sobremesas…)
- Produto: nome, descrição, **preço opcional**, **foto opcional**, tags, disponível sim/não, destaque, turno (almoço / noite / ambos)
- **Pizza meio a meio** e escolha de borda
- **Adicionais por produto** (bacon extra, catupiry…)

### Preço opcional (pedido da dona)
- Configuração no admin: **cardápio com preço** ou **sem preço** (geral), e também por produto
- Sem preço: card não mostra valor; carrinho e mensagem do WhatsApp saem só com itens e quantidades ("valor a confirmar")
- Com preço misto: mensagem soma o que tem preço e marca o resto como "a confirmar"
- Schema MenuItem sem `offers` quando não há preço
- Obs. do Pedro: discorda (preço ajuda conversão e respostas de IA), mas segue a decisão da cliente

## 8. Carrinho → WhatsApp
- Quantidades, observação por item, adicionais, meio a meio
- Pedido mínimo e taxa por bairro (só se houver preço)
- "Repetir último pedido" (salvo no aparelho)
- Abre `wa.me` com mensagem pronta — sem API do WhatsApp
- A definir: campos do checkout (nome, entrega/retirada, endereço, pagamento, troco)

## 9. Prova social
- Só avaliações reais do Google (manual no admin ou via API do Google Places — a decidir)
- Botões "Ver todas no Google" e "Avaliar no Google"
- Google não mostra estrelas no resultado para autoavaliação no próprio site

## 10. Painel administrativo
### 10.1 Login (simplificado — usuários leigos)
- Um único campo **"Telefone, e-mail ou usuário"** + senha — o sistema reconhece sozinho o que foi digitado
- Telefone aceito com ou sem máscara/DDD (normaliza para +55 37 9XXXX-XXXX)
- Senha simples permitida (mín. 6 caracteres ou PIN numérico de 6 dígitos), com botão "mostrar senha"
- "Manter conectado" ligado por padrão (sessão longa no celular)
- **Esqueci a senha**: o dono/admin redefine pelo painel da equipe (sem depender de e-mail ou SMS); por e-mail só para quem tiver
- Sem SMS no lançamento (custo por mensagem); login por código via WhatsApp/SMS fica como evolução futura
- Bloqueio temporário após várias tentativas erradas
- Tela de login grande, botões grandes, linguagem simples

### 10.2 Equipe e acessos
- Tela **"Equipe"**: adicionar pessoa com nome + telefone (ou e-mail, ou usuário) + senha inicial + perfil
- Perfis:
  - **Dono(a)**: tudo, inclusive equipe e configurações
  - **Gerente**: cardápios, preços, promoções, horários, FAQ, galeria, avaliações
  - **Social media / Conteúdo** (ex.: menina do Instagram): cardápio do almoço, galeria, promoções
  - **Atendente**: só ligar/desligar disponibilidade de produtos e "pausar pedidos"
- Ativar/desativar acesso sem apagar a pessoa
- Redefinir senha de qualquer membro
- Histórico simples: "quem alterou o quê e quando"
- Login dos usuários via Supabase Auth (telefone/usuário mapeados para conta interna) + permissões por perfil no banco (RLS)

### 10.3 Funções do painel
- **Atalho na tela inicial: "Colar cardápio do almoço"** (tarefa mais frequente)
- CRUD de categorias, produtos, adicionais, combos/promoções (com validade)
- Chave geral "mostrar preços" + preço opcional por produto
- Foto opcional por produto (card sem foto com layout próprio)
- Editar FAQ, horários, história, galeria, avaliações, redes, WhatsApp, pagamentos, SEO
- Botão "pausar pedidos"
- Métricas simples: cliques em "Enviar pedido" e produtos mais adicionados
- Campos para Google Analytics e Pixel do Meta

## Pendências / a decidir
- **Exemplos reais do texto do almoço** enviado no WhatsApp (3–5 dias) para calibrar a leitura automática
- Almoço: é self-service por peso, prato feito, marmitex ou tudo isso? (define como entra no carrinho)
- Campos do pedido no WhatsApp
- Identidade visual (cores vermelho e branco segundo o briefing; logo a receber)
- Taxa de entrega / bairros
- Avaliações: manual ou API do Google
- Quem da equipe terá acesso (nomes e perfis)
- Hospedagem definitiva após aprovação (VPS própria?)

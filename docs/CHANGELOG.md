# Histórico de versões – site do Aconchego

Cada entrega ganha um número de versão (**MAIOR.MENOR.CORREÇÃO**):
- **MAIOR** (2.0.0): mudança grande no site ou no jeito de usar o painel
- **MENOR** (1.3.0): função nova (ex.: tela nova, opção nova no painel)
- **CORREÇÃO** (1.2.1): ajuste pequeno ou conserto, sem função nova

A versão atual aparece no painel em **Mais › Versão do site** e fica no `package.json`.
Toda mudança enviada para o ar entra aqui no topo, em linguagem simples.

---

## 1.3.1 — 18/11/2026
- Página **Almoço de hoje** mais enxuta no celular: título curto ("Almoço de hoje" + local e horário em uma linha) e o botão **Quero um marmitex** já na primeira tela. O texto completo (bom para o Google) foi para o fim da página
- Botão "Quero um marmitex" com o preço embaixo, em uma linha só (também na página inicial)

## 1.3.0 — 18/11/2026
- Almoço: novo aviso dos itens com estrela no "Monte seu marmitex" ("Itens com estrela são especiais! Escolhendo um deles, seu marmitex fica com um valor diferente do convencional (R$ 32,00)"), mais visível
- O aviso é **editável no painel** em Almoço › Preços do marmitex (com prévia de como o cliente vê; {preco} vira o preço especial)
- Novidades: publicação "Em breve: soda italiana no Aconchego, em Pompéu – MG" com foto, escrita para Google e IAs (perguntas e respostas, endereço, horários)

## 1.2.0 — 18/11/2026
**Equipe e segurança**
- Consultoria PHAR (Pedro e José Rufino) protegida: ninguém da equipe consegue remover, bloquear, mudar o perfil ou trocar a senha deles
- A dona pode **remover** pessoas da equipe de vez (antes só dava para bloquear)
- Cadastro de pessoa mais claro: **usuário** (obrigatório), nome, telefone (opcional), e-mail (opcional) e senha (com botão de mostrar). Dá para editar os dados depois
- **Perguntas frequentes travadas**: só a consultoria edita (protege o SEO). Os outros veem as perguntas, mas não mudam

**Clientes**
- Todo pedido enviado pelo site guarda o cliente (nome, telefone e endereço) e o pedido no banco
- No pedido, novo campo **Seu telefone (WhatsApp)** (opcional para consumo na mesa) e aviso de privacidade
- Tela nova no painel: **Clientes** (busca, nº de pedidos, último pedido, WhatsApp do cliente, histórico, baixar planilha, apagar a pedido do cliente)
- **Conta de cliente opcional** (entra com telefone e senha; dados preenchidos sozinhos; "Meus últimos pedidos"). Liga/desliga no painel em Clientes. Pedir sem conta continua funcionando sempre

**Painel**
- **Busca inteligente** no topo do painel (lupa ou Ctrl+K): acha telas, ajustes, produtos, clientes, perguntas, novidades e equipe, sem precisar de acento

**App no celular (PWA)**
- O site pode ser **instalado no celular** (Android: botão "Instalar o app"; iPhone: passo a passo do Safari). Abre como app, com atalhos para Almoço, Cardápio e Meu pedido, e mostra uma tela amigável quando está sem internet

## 1.1.0 — 18/11/2026
- Pedido abre o WhatsApp em **nova aba** (o site continua aberto)
- **Taxa de entrega** vale para almoço e noite e entra no total
- **Bebidas**: aba própria na página inicial e página `/bebidas`
- **Menu do site editável** no painel (com **Início**)
- Almoço: **estrela** no lugar do foguinho; item com estrela deixa o marmitex no preço especial
- Aviso **"Já vai?"** revisado (botão Voltar, mouse saindo, rolagem rápida)

## 1.0.0 — 12 a 17/11/2026 (lançamento)
- Site com home, cardápio da noite (72 itens + bebidas), almoço do dia, perguntas frequentes, sobre, contato e novidades
- Carrinho → pedido pronto no WhatsApp (entrega, retirada, mesa; meio a meio; "a confirmar" sem preço)
- Painel: almoço (colar texto do WhatsApp), cardápio, fotos e novidades, equipe, ajustes, resultados
- Marmitex pelo site com preço normal e com churrasco
- SEO/GEO: schema, sitemap, llms.txt, 5 páginas de SEO local, FAQ completa
- Galeria com 18 fotos do Instagram, slogan e ano 1989

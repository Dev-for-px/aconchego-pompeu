# Pesquisa SEO / GEO — Aconchego (Pompéu/MG)

_12/11/2026. Base: briefing da cliente + varredura da SERP. Volumes de busca ainda não medidos (validar no Google Keyword Planner / Search Console depois do lançamento)._

## 1. Dados oficiais (NAP — usar idêntico em tudo)
- **Nome:** Restaurante e Pizzaria Aconchego
- **Nome estendido (secundário):** Restaurante, Pizzaria, Choperia e Churrascaria Aconchego
- **Endereço:** Praça Carlos Elói, 542 – Centro, Pompéu – MG, 35640-000 (próximo à Eletro Zema)
- **Telefone:** (37) 3523-3111 (ligação)
- **WhatsApp:** (37) 99994-3111 (WhatsApp e ligação)
- **Delivery por app:** Aiqfome
- **Instagram:** @rest.pizzariaaconchego
- **Horário:** almoço 11h–15h todos os dias · jantar 18h–00h (exceto segunda)
- **Desde:** 2010 (no mesmo ponto há 23 anos — confirmar texto com José Carlos)

> Grafia: decidir "Choperia" (correto) e usar "chopperia" só como variação no texto/FAQ. Mesmo para "Carlos Elói" × "Carlos Eloi": escolher uma forma e igualar no Google Meu Negócio.

## 2. Achados da SERP
- **Concorrência online quase nula:** nenhum restaurante de Pompéu com site próprio apareceu; resultados são guias genéricos e agregadores. Janela clara para ranquear rápido.
- **Ambiguidade do nome da cidade:** buscas por "Pompéu" misturam **Pompéia (SP)**, **Pompéia (bairro de BH)** e **bairro Pompéu em Sabará**. Por isso: sempre escrever **"Pompéu – MG"**, com acento, e reforçar no schema (`addressLocality`, `addressRegion`, CEP, geo-coordenadas) e no texto ("centro de Pompéu, Minas Gerais").
- Concorrentes citados no briefing: Paiol, Restaurante Quati (churrascaria), Dona Lia, Joaquim Espeto — nenhum com site ranqueando.
- Sem Facebook nem TripAdvisor: criar ambos (citações locais ajudam IA e Google).

## 3. Palavras-chave
### Principais (foco)
| Termo | Página-alvo |
|---|---|
| restaurante em Pompéu | Home |
| pizzaria em Pompéu | /cardapio/pizzas |
| choperia / chopp em Pompéu | /cardapio/bebidas + seção chopp |
| churrascaria / churrasco em Pompéu | /cardapio/porcoes-na-chapa (picanha) |
| onde jantar em Pompéu | Home (seção jantar) + FAQ |

### Secundárias (serviços que eles oferecem)
- almoço em Pompéu · self-service em Pompéu · comida caseira Pompéu
- marmitex em Pompéu · restaurante à la carte Pompéu
- pizza delivery Pompéu · entrega de pizza Pompéu · pedir pizza Pompéu
- picanha na chapa Pompéu · porções em Pompéu · petiscos Pompéu
- restaurante para família / casal em Pompéu · restaurante com estacionamento Pompéu
- restaurante para eventos / confraternização em Pompéu · reserva de mesa Pompéu
- restaurante aberto domingo / segunda no almoço Pompéu · restaurante aberto até meia-noite Pompéu
- restaurante no centro de Pompéu

### Marca
- aconchego pompéu · pizzaria aconchego · restaurante aconchego pompéu · aconchego cardápio · aconchego telefone / whatsapp

## 4. Perguntas para FAQ (formato busca de IA)
1. Qual o melhor restaurante para jantar em Pompéu?
2. Tem pizzaria com delivery em Pompéu?
3. Qual o horário do Restaurante Aconchego?
4. O Aconchego abre na segunda à noite? (não — só almoço)
5. Onde fica o Restaurante Aconchego em Pompéu?
6. O Aconchego tem self-service no almoço?
7. Vocês vendem marmitex?
8. Qual a taxa de entrega? (a partir de R$ 4,00, conforme endereço)
9. Quais formas de pagamento? (dinheiro, Pix, débito, crédito, vale-refeição)
10. Dá pra pedir pelo Aiqfome?
11. Tem chopp gelado?
12. Fazem reserva de mesa e eventos?
13. Tem estacionamento e acessibilidade?
14. Tem área externa / Wi-Fi / TV para jogos?
15. Pode pizza meio a meio?

## 5. Estrutura de páginas sugerida
- `/` Home — H1: "Restaurante e Pizzaria Aconchego em Pompéu – MG"
- `/cardapio` + uma página por categoria (pizzas, porções na chapa, pratos, self-service, bebidas/chopp, sobremesas)
- `/sobre` — história desde 2010, fatos citáveis
- `/delivery` — WhatsApp, Aiqfome, taxa, retirada
- `/eventos-e-reservas`
- `/contato` — mapa, horários, NAP
- FAQ na home + página `/perguntas-frequentes`

## 6. Schema (JSON-LD)
- `Restaurant` com `servesCuisine` (Pizza, Brasileira, Churrasco, Comida caseira), `priceRange`, `acceptsReservations: true`, `hasMenu`, `openingHoursSpecification`, `geo`, `sameAs` (Instagram, Aiqfome, Linktree, GMN)
- `amenityFeature`: estacionamento, acessibilidade, área externa, Wi-Fi, TV
- `paymentAccepted`: Dinheiro, Pix, Cartão de débito, Cartão de crédito, Vale-refeição
- `Menu` / `MenuSection` / `MenuItem` (sem `offers` quando sem preço)
- `FAQPage`, `BreadcrumbList`

## 7. Off-page / citações locais
- Google Meu Negócio: recuperar acesso (com Laura), categorias Restaurante (principal), Pizzaria, Choperia, Churrascaria; link do site; QR Code de avaliação nas mesas
- Criar: Facebook, TripAdvisor, Bing Places, Apple Maps (Apple Business Connect)
- Igualar NAP no Aiqfome, Instagram, Linktree
- Pedir avaliações que citem "pizza", "jantar", "chopp" naturalmente

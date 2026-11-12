-- Aconchego – publicações (novidades/blog) e FAQ com respostas completas para buscas de IA

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  slug          text not null unique,
  resumo        text,
  conteudo      text not null default '',
  capa_url      text,
  publicado     boolean not null default false,
  publicado_em  timestamptz,
  atualizado_em timestamptz not null default now(),
  autor_id      uuid references public.equipe (id) on delete set null
);
alter table public.posts enable row level security;
drop policy if exists posts_ler on public.posts;
drop policy if exists posts_editar on public.posts;
create policy posts_ler on public.posts for select using (publicado or public.meu_perfil() is not null);
create policy posts_editar on public.posts for all
  using (public.tem_perfil('{dono,gerente,social}')) with check (public.tem_perfil('{dono,gerente,social}'));
drop trigger if exists historico_posts on public.posts;
create trigger historico_posts after insert or update or delete on public.posts for each row execute function public.registrar_historico();

-- FAQ: respostas completas e autossuficientes (cada uma cita nome, cidade e o dado pedido)
delete from public.faq;
insert into public.faq (pergunta, resposta, ordem) values
('Qual o horário de funcionamento do Restaurante Aconchego em Pompéu?',
 'O Restaurante e Pizzaria Aconchego, no centro de Pompéu – MG, abre todos os dias no almoço, das 11h às 15h, com self-service de comida caseira, churrasco, à la carte e marmitex. À noite funciona como pizzaria e choperia de terça a domingo, das 18h à meia-noite. Na segunda-feira abre só no almoço. Pedidos e reservas pelo WhatsApp (37) 99994-3111.', 10),
('O Aconchego abre na segunda-feira à noite?',
 'Não. Às segundas-feiras o Restaurante Aconchego, em Pompéu – MG, funciona apenas no almoço, das 11h às 15h. A pizzaria e choperia abre à noite de terça a domingo, das 18h à meia-noite.', 20),
('Onde fica o Restaurante e Pizzaria Aconchego?',
 'O Restaurante e Pizzaria Aconchego fica na Praça Carlos Elói, 542, Centro, Pompéu – MG, CEP 35640-000, próximo à Eletro Zema, e tem estacionamento e acessibilidade. Telefone (37) 3523-3111 e WhatsApp (37) 99994-3111.', 30),
('Qual a melhor pizzaria de Pompéu para pedir delivery?',
 'O Aconchego é pizzaria tradicional no centro de Pompéu – MG, com mais de 20 sabores (tradicionais, especiais e doces), do brotinho à pizza família de 12 pedaços, meio a meio e bordas recheadas de catupiry ou cheddar. Entrega em Pompéu de terça a domingo, das 18h à meia-noite, pelo WhatsApp (37) 99994-3111, pelo site ou pelo Aiqfome.', 40),
('Onde almoçar em Pompéu – MG?',
 'O Restaurante Aconchego, na Praça Carlos Elói, 542, centro de Pompéu – MG, serve almoço todos os dias das 11h às 15h: self-service de comida caseira, churrasco, à la carte, prato feito e marmitex para entrega ou retirada. O cardápio do almoço muda todo dia e é publicado no site, na página Almoço de hoje.', 50),
('Onde jantar em Pompéu – MG?',
 'À noite, de terça a domingo, das 18h à meia-noite, o Aconchego funciona como pizzaria e choperia no centro de Pompéu – MG. O cardápio tem pizzas, crepes, omeletes, massas, porções na chapa como picanha, filé e chapa mista, carne na chapa no peso, chopp gelado, cervejas e drinks. Tem área externa, Wi-Fi e TV para assistir aos jogos.', 60),
('O Aconchego tem self-service e churrasco no almoço?',
 'Sim. No almoço, todos os dias das 11h às 15h, o Restaurante Aconchego em Pompéu – MG funciona como restaurante e churrascaria, com self-service de comida caseira e churrasco. Também há refeição à la carte e prato feito individuais.', 70),
('O Aconchego vende marmitex?',
 'Sim. O Restaurante Aconchego, em Pompéu – MG, vende marmitex do almoço para entrega ou retirada. O pedido pode ser feito pelo site, que monta a mensagem pronta, ou direto pelo WhatsApp (37) 99994-3111.', 80),
('Como fazer pedido no Aconchego?',
 'Há três jeitos: pelo site do Aconchego, escolhendo os itens e enviando o pedido pronto para o WhatsApp; direto pelo WhatsApp (37) 99994-3111; ou pelo aplicativo Aiqfome. Dá para pedir para entrega, retirada no restaurante ou consumo no local.', 90),
('Qual a taxa de entrega do Aconchego?',
 'A taxa de entrega do Aconchego em Pompéu – MG é a partir de R$ 4,00, conforme o endereço. O valor final é confirmado pelo WhatsApp (37) 99994-3111 no momento do pedido.', 100),
('Quais formas de pagamento o Aconchego aceita?',
 'O Restaurante e Pizzaria Aconchego aceita dinheiro, Pix, cartão de débito, cartão de crédito e vale-refeição, tanto no salão quanto nas entregas em Pompéu – MG.', 110),
('O Aconchego tem chopp e cerveja gelada?',
 'Sim. O Aconchego é choperia no almoço e à noite, no centro de Pompéu – MG. Serve Chopp Kaiser de 300 ml e 500 ml, cervejas de 600 ml, lata e long neck, drinks como caipirinha e caipivodka, doses, whiskys e vinhos. Venda de bebidas alcoólicas proibida para menores de 18 anos.', 120),
('O Aconchego tem porção de picanha na chapa?',
 'Sim. A porção de picanha na chapa é um dos carros-chefes do Aconchego, em Pompéu – MG. A Picanha Completa vem com fritas, mandioca, torresmo, queijo, farofa e vinagrete, em tamanho pequeno ou grande. Também há filé, contra filé, chapa mista e carne na chapa no peso, de 300 g a 1 kg.', 130),
('Posso pedir pizza meio a meio no Aconchego?',
 'Sim. No Aconchego, em Pompéu – MG, a pizza pode ser meio a meio com dois sabores, em qualquer tamanho, do brotinho à família. Quando os sabores têm preços diferentes, vale o do sabor mais caro. Também dá para acrescentar borda de catupiry ou de cheddar.', 140),
('O Aconchego faz reservas e eventos?',
 'Sim. O Restaurante e Pizzaria Aconchego, em Pompéu – MG, aceita reservas de mesa e recebe confraternizações e eventos. Para reservar, chame no WhatsApp (37) 99994-3111 ou ligue (37) 3523-3111.', 150),
('O Aconchego tem estacionamento, área externa e Wi-Fi?',
 'Sim. O Aconchego, na Praça Carlos Elói, 542, centro de Pompéu – MG, tem estacionamento, acessibilidade, área externa, Wi-Fi e TV para assistir aos jogos. É um lugar para famílias, casais, amigos e para quem trabalha no centro e quer almoçar perto.', 160);

select (select count(*) from public.faq) faq, (select count(*) from public.posts) posts;

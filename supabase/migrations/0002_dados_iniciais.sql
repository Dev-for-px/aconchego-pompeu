-- =====================================================================
-- Aconchego – dados iniciais (configurações, categorias e FAQ)
-- Os produtos reais entram pelo painel; aqui só o esqueleto.
-- =====================================================================

insert into public.configuracoes (id, horarios, redes, historia, seo)
values (
  1,
  '{
    "almoco": {"inicio": "11:00", "fim": "15:00", "dias": [0,1,2,3,4,5,6]},
    "jantar": {"inicio": "18:00", "fim": "00:00", "dias": [0,2,3,4,5,6]},
    "excecoes": []
  }'::jsonb,
  '{
    "instagram": "https://www.instagram.com/rest.pizzariaaconchego/",
    "linktree": "https://linktr.ee/restaurantepizzariaaconchego",
    "aiqfome": ""
  }'::jsonb,
  'Desde 2010 no centro de Pompéu – MG, o Restaurante e Pizzaria Aconchego serve comida caseira no almoço e pizza, porções na chapa e chopp à noite.',
  '{
    "titulo": "Restaurante e Pizzaria Aconchego | Pompéu – MG",
    "descricao": "Restaurante, pizzaria, choperia e churrascaria no centro de Pompéu – MG. Almoço todos os dias e pizzaria à noite. Peça pelo WhatsApp."
  }'::jsonb
)
on conflict (id) do nothing;

insert into public.categorias (nome, slug, turno, ordem) values
  ('Self-service e pratos', 'self-service',      'almoco', 10),
  ('Marmitex',              'marmitex',          'almoco', 20),
  ('Pizzas',                'pizzas',            'noite',  30),
  ('Porções na chapa',      'porcoes-na-chapa',  'noite',  40),
  ('Petiscos',              'petiscos',          'noite',  50),
  ('Chopp e bebidas',       'bebidas',           'ambos',  60),
  ('Sobremesas',            'sobremesas',        'ambos',  70)
on conflict (slug) do nothing;

insert into public.faq (pergunta, resposta, ordem) values
  ('Qual o horário do Restaurante Aconchego?',
   'Almoço todos os dias, das 11h às 15h. Jantar (pizzaria e choperia) das 18h à meia-noite, exceto às segundas-feiras.', 10),
  ('O Aconchego abre na segunda à noite?',
   'Não. Na segunda-feira funcionamos só no almoço, das 11h às 15h.', 20),
  ('Onde fica o Restaurante Aconchego em Pompéu?',
   'Na Praça Carlos Elói, 542, Centro, Pompéu – MG, próximo à Eletro Zema.', 30),
  ('Tem pizzaria com delivery em Pompéu?',
   'Sim. O Aconchego entrega pizza e porções em Pompéu. Peça pelo WhatsApp (37) 99994-3111 ou pelo Aiqfome.', 40),
  ('O Aconchego tem self-service no almoço?',
   'Sim. No almoço servimos self-service de comida caseira e churrasco, todos os dias.', 50),
  ('Vocês vendem marmitex?',
   'Sim. Peça sua marmitex pelo WhatsApp (37) 99994-3111 para entrega ou retirada.', 60),
  ('Qual a taxa de entrega?',
   'A partir de R$ 4,00, conforme o endereço.', 70),
  ('Quais formas de pagamento vocês aceitam?',
   'Dinheiro, Pix, cartão de débito, cartão de crédito e vale-refeição.', 80),
  ('Dá para pedir pelo Aiqfome?',
   'Sim, o Aconchego está no Aiqfome. Também atendemos direto pelo WhatsApp (37) 99994-3111.', 90),
  ('Tem chopp gelado?',
   'Sim. À noite o Aconchego funciona como choperia, com chopp gelado, porções e pizza.', 100),
  ('Fazem reserva de mesa e eventos?',
   'Sim. Reservas e eventos pelo WhatsApp (37) 99994-3111 ou pelo telefone (37) 3523-3111.', 110),
  ('Tem estacionamento e acessibilidade?',
   'Sim, o Aconchego tem estacionamento e acessibilidade.', 120),
  ('Tem área externa, Wi-Fi e TV para jogos?',
   'Sim. Temos área externa, Wi-Fi e TV para assistir aos jogos.', 130),
  ('Pode pedir pizza meio a meio?',
   'Sim, é só escolher os dois sabores no cardápio do site ou avisar no WhatsApp.', 140);

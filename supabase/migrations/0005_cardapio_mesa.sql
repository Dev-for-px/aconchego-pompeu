-- Aconchego – ajustes do cardápio de mesa (noite) + correção de 12/11: bebidas alcoólicas,
-- refeição executiva, novos itens de porções/bebidas (sem preço por enquanto) e acréscimos por tamanho.

-- Acréscimos: Pequena/Média/Grande R$ 8 · Gigante/Família R$ 10 (correção)
update public.adicionais set preco_por_variacao = '{"Brotinho":8,"Pequena (4 pedaços)":8,"Média (6 pedaços)":8,"Grande (8 pedaços)":8,"Gigante (10 pedaços)":10,"Família (12 pedaços)":10}'::jsonb;

-- Descrições corrigidas
update public.produtos set descricao = 'Muçarela, atum, milho verde, tomate, cebola, milho, pimentão e orégano' where slug = 'pizza-atum';
update public.produtos set descricao = 'Muçarela, frango, catupiry, tomate, milho e orégano' where slug = 'pizza-frango-com-catupiry';
update public.produtos set descricao = 'Muçarela, chocolate e leite condensado' where slug = 'pizza-de-chocolate';
update public.produtos set nome = 'Pizza Três Porquinhos', descricao = 'Muçarela, calabresa, bacon, lombo, cebola roxa, tomate e molho barbecue', tags = '{}',
  variacoes = (select variacoes from public.produtos where slug = 'pizza-calabresa') where slug = 'pizza-3-porquinhos';
update public.produtos set nome = 'Crepe Strogonoff de Filé', descricao = 'Muçarela, filé e molho de strogonoff' where slug = 'crepe-strogonofe-de-file';

-- Porções: nomes da mesa (Pequena/Grande) e Picanha separada do Filé
update public.produtos set variacoes = (select jsonb_agg(jsonb_build_object('nome', case v->>'nome' when 'Meia' then 'Pequena' when 'Inteira' then 'Grande' else v->>'nome' end, 'preco', v->'preco')) from jsonb_array_elements(variacoes) v)
  where categoria_id in (select id from public.categorias where slug in ('porcoes-na-chapa','guarnicoes')) and jsonb_array_length(variacoes) > 0;
update public.produtos set nome = 'Picanha Completa', slug = 'picanha-completa', descricao = 'Fritas, mandioca, torresmo, queijo, farofa e vinagrete' where slug = 'picanha-ou-file-completo';
update public.produtos set descricao = 'Fritas, mandioca, torresmo, queijo, farofa e vinagrete' where slug = 'contra-file-completo';

-- Categorias novas (bebidas valem no almoço e à noite)
update public.categorias set nome = 'Bebidas sem álcool', descricao = 'Refrigerantes, sucos, águas e energéticos, no almoço e à noite.' where slug = 'bebidas';
insert into public.categorias (slug, nome, turno, ordem, descricao) values
  ('refeicao-executiva', 'Refeição executiva', 'noite', 52, 'Refeição individual: à la carte ou prato feito.'),
  ('cervejas-e-chopp', 'Cervejas e chopp', 'ambos', 64, 'Chopp Kaiser e cervejas geladas, no almoço e à noite. Venda proibida para menores de 18 anos.'),
  ('drinks', 'Drinks', 'ambos', 66, 'Caipirinhas, caipivodkas e drinks da casa. Venda proibida para menores de 18 anos.'),
  ('doses', 'Doses', 'ambos', 67, 'Venda proibida para menores de 18 anos.'),
  ('whiskys', 'Whiskys', 'ambos', 68, 'Venda proibida para menores de 18 anos.'),
  ('vinhos', 'Vinhos', 'ambos', 69, 'Venda proibida para menores de 18 anos.')
on conflict (slug) do update set nome = excluded.nome, turno = excluded.turno, ordem = excluded.ordem, descricao = excluded.descricao, ativo = true;

-- Itens novos (sem preço até a casa informar)
insert into public.produtos (categoria_id, nome, slug, descricao, variacoes, ordem)
select c.id, x.nome, x.slug, x.descricao, coalesce(x.variacoes, '[]'::jsonb), x.ordem
from (values
  ('porcoes-na-chapa','Filé Completo','file-completo','Fritas, mandioca, torresmo, queijo, farofa e vinagrete','[{"nome":"Pequena","preco":92},{"nome":"Grande","preco":132}]'::jsonb,265),
  ('porcoes-na-chapa','Farofa','farofa',null,'[{"nome":"Pequena","preco":null},{"nome":"Grande","preco":null}]'::jsonb,392),
  ('porcoes-na-chapa','Vinagrete','vinagrete',null,'[{"nome":"Pequena","preco":null},{"nome":"Grande","preco":null}]'::jsonb,394),
  ('refeicao-executiva','À la Carte (individual)','a-la-carte-individual','Refeição completa com porções separadas: arroz, feijão em caldo ou tropeiro, carne de sua preferência, saladas, batata frita ou macarrão',null,10),
  ('refeicao-executiva','Prato Feito (individual)','prato-feito-individual','Prato montado com arroz, feijão em caldo ou tropeiro, carne de sua preferência, saladas, batata frita ou macarrão',null,20),
  ('refeicao-executiva','Bife','bife','Boi, porco ou filé de frango',null,30),
  ('refeicao-executiva','Ovo Frito','ovo-frito',null,null,40),
  ('refeicao-executiva','Salada Simples','salada-simples',null,null,50),
  ('refeicao-executiva','Salada Completa','salada-completa',null,null,60),
  ('bebidas','Refrigerante KS','refrigerante-ks',null,null,600),
  ('bebidas','Suco Natural','suco-natural',null,null,705),
  ('bebidas','Jarra de Suco','jarra-de-suco',null,'[{"nome":"1 litro","preco":null},{"nome":"1,5 litro","preco":null}]'::jsonb,706),
  ('bebidas','Suco Lata','suco-lata',null,null,707),
  ('bebidas','Água Tônica','agua-tonica',null,null,720),
  ('bebidas','Água de Coco','agua-de-coco',null,null,730),
  ('bebidas','Gatorade','gatorade',null,null,740),
  ('bebidas','Energético','energetico',null,null,750),
  ('bebidas','Red Bull','red-bull',null,null,760),
  ('cervejas-e-chopp','Chopp Kaiser','chopp-kaiser',null,'[{"nome":"300 ml","preco":null},{"nome":"500 ml","preco":null}]'::jsonb,10),
  ('cervejas-e-chopp','Brahma 600 ml','brahma-600-ml',null,null,20),
  ('cervejas-e-chopp','Skol 600 ml','skol-600-ml',null,null,30),
  ('cervejas-e-chopp','Original 600 ml','original-600-ml',null,null,40),
  ('cervejas-e-chopp','Heineken 600 ml','heineken-600-ml',null,null,50),
  ('cervejas-e-chopp','Brahma Lata','brahma-lata',null,null,60),
  ('cervejas-e-chopp','Skol Lata','skol-lata',null,null,70),
  ('cervejas-e-chopp','Brahma Zero Lata','brahma-zero-lata',null,null,80),
  ('cervejas-e-chopp','Heineken Zero Lata','heineken-zero-lata',null,null,90),
  ('cervejas-e-chopp','Heineken Long Neck','heineken-long-neck',null,null,100),
  ('cervejas-e-chopp','Skol Beats','skol-beats',null,null,110),
  ('cervejas-e-chopp','Ice','ice',null,null,120),
  ('drinks','Espanhola','espanhola','Vinho, morango e leite condensado',null,10),
  ('drinks','Caipirinha','caipirinha','Limão',null,20),
  ('drinks','Cozumel','cozumel','Limão e sal',null,30),
  ('drinks','Caipifruta','caipifruta','Leite condensado, morango ou abacaxi',null,40),
  ('drinks','Caipivodka Orloff','caipivodka-orloff','Limão, morango ou abacaxi',null,50),
  ('drinks','Caipivodka Absolut','caipivodka-absolut','Limão, morango ou abacaxi',null,60),
  ('doses','Cachaça Branca','cachaca-branca',null,null,10),
  ('doses','Cachaça Amarela','cachaca-amarela',null,null,20),
  ('doses','Cachaça Ligurita','cachaca-ligurita',null,null,30),
  ('doses','Cachaça Cristalina do Picão','cachaca-cristalina-do-picao',null,null,40),
  ('doses','Rum Bacardi','rum-bacardi',null,null,50),
  ('doses','Rum Montilla','rum-montilla',null,null,60),
  ('doses','Conhaque Presidente','conhaque-presidente',null,null,70),
  ('doses','Campari','campari',null,null,80),
  ('doses','Tequila','tequila',null,null,90),
  ('doses','Vodka Orloff','vodka-orloff',null,null,100),
  ('doses','Vodka Absolut','vodka-absolut',null,null,110),
  ('doses','Gin Seagers','gin-seagers',null,null,120),
  ('doses','Gin Beefeater','gin-beefeater',null,null,130),
  ('doses','Gin Tanqueray','gin-tanqueray',null,null,140),
  ('whiskys','Black Label','black-label',null,null,10),
  ('whiskys','Red Label','red-label',null,null,20),
  ('whiskys','Ballantine''s Finest','ballantines-finest',null,null,30),
  ('whiskys','Buchanan''s 12 Anos','buchanans-12-anos',null,null,40),
  ('whiskys','Grand Old Parr','grand-old-parr',null,null,50),
  ('whiskys','Jack Daniel''s','jack-daniels',null,null,60),
  ('whiskys','Chivas 12 Anos','chivas-12-anos',null,null,70),
  ('whiskys','Logan 12 Anos','logan-12-anos',null,null,80),
  ('whiskys','White Horse','white-horse',null,null,90),
  ('vinhos','Vinho Taça (Pérgola)','vinho-taca-pergola',null,null,10),
  ('vinhos','Pérgola','pergola',null,null,20),
  ('vinhos','Periquita','periquita',null,null,30),
  ('vinhos','Reservado','reservado',null,null,40),
  ('vinhos','Gato Negro','gato-negro',null,null,50),
  ('vinhos','Mioranza','mioranza',null,null,60),
  ('vinhos','Tomaz','tomaz',null,null,70)
) as x(cat, nome, slug, descricao, variacoes, ordem)
join public.categorias c on c.slug = x.cat
on conflict (slug) do nothing;

update public.faq set resposta = 'Sim. O Aconchego é choperia no almoço e à noite: Chopp Kaiser de 300 ml e 500 ml, cervejas, drinks e doses.' where pergunta = 'Tem chopp gelado?';

select (select count(*) from public.produtos) produtos, (select count(*) from public.categorias where ativo) categorias, (select count(*) from public.produtos where preco is null and variacoes = '[]'::jsonb) sem_preco;

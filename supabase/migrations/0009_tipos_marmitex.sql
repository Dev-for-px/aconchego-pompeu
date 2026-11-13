-- Tipos de marmitex iniciais (sem preço: a equipe define no painel, em Almoço › Tipos de marmitex).
-- Só insere se a categoria Marmitex ainda estiver vazia.
insert into public.produtos (categoria_id, nome, slug, descricao, preco, variacoes, ordem, disponivel)
select c.id, x.nome, x.slug, null, null, '[]'::jsonb, x.ordem, true
from public.categorias c
cross join (values
  ('Marmitex', 'marmitex-tradicional', 0),
  ('Marmitex com churrasco', 'marmitex-com-churrasco', 1),
  ('Mini marmitex', 'mini-marmitex', 2),
  ('Marmitex no quilo', 'marmitex-no-quilo', 3)
) as x(nome, slug, ordem)
where c.slug = 'marmitex'
  and not exists (select 1 from public.produtos p where p.categoria_id = c.id)
on conflict (slug) do nothing;

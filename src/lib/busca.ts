import { paraPedido } from "@/components/CardProduto";
import type { ItemBusca } from "@/components/Busca";
import { precoMinimo, type Categoria, type Produto } from "./dados";

/** Lista enxuta de produtos disponíveis para a barra de pesquisa. */
export function montarBusca(secoes: (Categoria & { produtos: Produto[] })[]): ItemBusca[] {
  const vistos = new Set<string>();
  const itens: ItemBusca[] = [];
  for (const c of secoes) {
    const sabores = c.produtos.filter((x) => x.meio_a_meio && x.disponivel).map(paraPedido);
    for (const p of c.produtos) {
      if (!p.disponivel || vistos.has(p.id)) continue;
      vistos.add(p.id);
      itens.push({ p: paraPedido(p), categoria: c.nome, precoMin: precoMinimo(p), varios: p.variacoes.length > 1, sabores: p.meio_a_meio ? sabores : [] });
    }
  }
  return itens;
}

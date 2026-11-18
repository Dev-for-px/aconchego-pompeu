// Regras do marmitex usadas no site e no painel (arquivo sem código de servidor: pode ser importado em qualquer lugar).
// Itens do cardápio do dia marcados com ESTRELA são "especiais" (churrasco, salmão etc.):
// se o cliente escolher um deles, o marmitex passa para o preço especial (mais caro).
// No banco a marca continua no campo `churrasco` do item (compatível com os cardápios já salvos).
import type { Variacao } from "./dados";

/** Nome da variação que guarda o preço especial do marmitex em `produtos.variacoes`. */
export const VARIACAO_ESPECIAL = "Especial";
/** Nome antigo (antes da estrela): ainda é lido para não perder preços já cadastrados. */
const VARIACAO_ANTIGA = "Com churrasco";

/** Preço especial do marmitex (lê o nome novo e o antigo). */
export function precoEspecialDe(variacoes: Variacao[] | null | undefined) {
  const v = variacoes ?? [];
  return (v.find((x) => x.nome === VARIACAO_ESPECIAL) ?? v.find((x) => x.nome === VARIACAO_ANTIGA))?.preco ?? null;
}

/** Sugestão automática de estrela: churrasco (pelo nome do item ou do grupo). A equipe marca/desmarca no painel. */
export function pareceEspecial(nome: string, secao = "") {
  return /churrasc/i.test(nome) || /churrasc/i.test(secao);
}

/** Item tem estrela? Vale a marca do painel; cardápios antigos (sem marca) usam a sugestão pelo nome. */
export function ehEspecial(item: { nome: string; churrasco?: boolean }, secao = "") {
  return item.churrasco ?? pareceEspecial(item.nome, secao);
}

/** "Salmão" · "Salmão e Picanha" · "Salmão, Picanha e Costela" */
export function juntarNomes(nomes: string[]) {
  return nomes.length <= 1 ? (nomes[0] ?? "") : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

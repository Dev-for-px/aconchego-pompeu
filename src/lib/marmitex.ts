// Regras do marmitex usadas no site e no painel (arquivo sem código de servidor: pode ser importado em qualquer lugar).

/** Nome da variação que guarda o preço do marmitex com churrasco em `produtos.variacoes`. */
export const VARIACAO_CHURRASCO = "Com churrasco";

/** Item de churrasco? Vale pelo nome do item ou pelo nome do grupo (ex.: "Churrasco:"). A equipe pode corrigir no painel. */
export function pareceChurrasco(nome: string, secao = "") {
  return /churrasc/i.test(nome) || /churrasc/i.test(secao);
}

// Lê o texto do cardápio do almoço como chega no WhatsApp e separa em seções e itens.
import type { SecaoAlmoco } from "../dados";

const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu;
const IGNORAR = /^(bom dia|boa tarde|boa noite|ol[aá]|card[aá]pio( do dia| de hoje)?|almo[cç]o( do dia| de hoje)?|hoje|segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo)\b[^a-z]*$/i;
const DATA = /^\(?\d{1,2}[/.-]\d{1,2}([/.-]\d{2,4})?\)?$/;

function limpar(linha: string) {
  return linha
    .replace(EMOJI, "")
    .replace(/[*_~]/g, "")
    .replace(/^\s*([-–—•▪▫◦●○►▶➡→✅✔]|\d+[.)-])\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function precoDe(txt: string): { nome: string; preco: number | null } {
  const m = txt.match(/R\$\s*(\d+(?:[.,]\d{1,2})?)/i) ?? txt.match(/(?:^|\s)(\d+,\d{2})\s*$/);
  if (!m) return { nome: txt, preco: null };
  const preco = Number(m[1].replace(",", "."));
  const nome = txt.replace(m[0], "").replace(/[\s.:–-]+$/, "").trim();
  return { nome, preco: Number.isFinite(preco) ? preco : null };
}

function capitalizar(s: string) {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E|Com|Ao|À|A)\b/g, (w) => w.toLowerCase());
}

export function lerCardapioAlmoco(texto: string): SecaoAlmoco[] {
  const secoes: SecaoAlmoco[] = [];
  let atual: SecaoAlmoco | null = null;
  for (const bruta of texto.split(/\r?\n/)) {
    const original = bruta.trim();
    if (!original) continue;
    const linha = limpar(original);
    if (!linha || DATA.test(linha) || IGNORAR.test(linha)) continue;

    const entreAsteriscos = /^\*[^*]+\*:?$/.test(original.replace(EMOJI, "").trim());
    const terminaComDoisPontos = /:$/.test(linha);
    const tudoMaiusculo = linha.length <= 40 && linha === linha.toUpperCase() && /\p{L}/u.test(linha) && !/R\$/.test(linha);
    if (terminaComDoisPontos || entreAsteriscos || tudoMaiusculo) {
      atual = { secao: capitalizar(linha.replace(/:$/, "").trim()), itens: [] };
      secoes.push(atual);
      continue;
    }
    if (!atual) {
      atual = { secao: "Cardápio do dia", itens: [] };
      secoes.push(atual);
    }
    const { nome, preco } = precoDe(linha);
    if (nome) atual.itens.push({ nome: capitalizar(nome), preco });
  }
  return secoes.filter((s) => s.itens.length > 0);
}

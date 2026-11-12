// Dados oficiais (NAP) — manter idênticos a docs/pesquisa-seo.md e ao Google Meu Negócio.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aconchego-pompeu.vercel.app").replace(/\/$/, "");

export const NEGOCIO = {
  nome: "Restaurante e Pizzaria Aconchego",
  nomeCurto: "Aconchego",
  nomeEstendido: "Restaurante, Pizzaria, Choperia e Churrascaria Aconchego",
  desde: 2010,
  endereco: {
    rua: "Praça Carlos Elói, 542",
    bairro: "Centro",
    cidade: "Pompéu",
    uf: "MG",
    cep: "35640-000",
    referencia: "próximo à Eletro Zema",
  },
  telefone: "553735233111",
  whatsapp: "5537999943111",
  instagram: "https://www.instagram.com/rest.pizzariaaconchego/",
  linktree: "https://linktr.ee/restaurantepizzariaaconchego",
  mapsBusca: "https://www.google.com/maps/search/?api=1&query=Restaurante+e+Pizzaria+Aconchego+Pra%C3%A7a+Carlos+El%C3%B3i+542+Pomp%C3%A9u+MG",
  mapsEmbed: "https://www.google.com/maps?q=Pra%C3%A7a+Carlos+El%C3%B3i+542+Centro+Pomp%C3%A9u+MG&output=embed",
  formasPagamento: ["Dinheiro", "Pix", "Cartão de débito", "Cartão de crédito", "Vale-refeição"],
  comodidades: ["Estacionamento", "Acessibilidade", "Área externa", "Wi-Fi", "TV para jogos"],
} as const;

export const ENDERECO_LINHA = `${NEGOCIO.endereco.rua} – ${NEGOCIO.endereco.bairro}, ${NEGOCIO.endereco.cidade} – ${NEGOCIO.endereco.uf}, ${NEGOCIO.endereco.cep}`;

/** 553735233111 -> (37) 3523-3111 */
export function formatarTelefone(digitos: string) {
  const d = digitos.replace(/\D/g, "").replace(/^55/, "");
  const ddd = d.slice(0, 2);
  const num = d.slice(2);
  return num.length === 9
    ? `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`
    : `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
}

export function linkWhatsApp(mensagem?: string, numero: string = NEGOCIO.whatsapp) {
  return `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}

export function formatarPreco(valor: number | null | undefined) {
  if (valor == null) return null;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// JSON-LD (schema.org) — ajuda Google e IAs a entenderem o restaurante.
import { NEGOCIO, SITE_URL } from "./site";
import type { Faq, Produto } from "./dados";

const ID = `${SITE_URL}/#restaurante`;

export function restauranteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": ID,
    name: NEGOCIO.nome,
    alternateName: [NEGOCIO.nomeEstendido, "Aconchego Pompéu"],
    url: SITE_URL,
    telephone: `+${NEGOCIO.telefone}`,
    image: `${SITE_URL}/opengraph-image`,
    foundingDate: String(NEGOCIO.desde),
    servesCuisine: ["Pizza", "Comida brasileira", "Churrasco", "Comida caseira"],
    priceRange: "$$",
    acceptsReservations: true,
    hasMenu: `${SITE_URL}/cardapio`,
    paymentAccepted: NEGOCIO.formasPagamento.join(", "),
    address: {
      "@type": "PostalAddress",
      streetAddress: NEGOCIO.endereco.rua,
      addressLocality: NEGOCIO.endereco.cidade,
      addressRegion: NEGOCIO.endereco.uf,
      postalCode: NEGOCIO.endereco.cep,
      addressCountry: "BR",
    },
    areaServed: { "@type": "City", name: "Pompéu", containedInPlace: { "@type": "State", name: "Minas Gerais" } },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "11:00", closes: "15:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "18:00", closes: "23:59" },
    ],
    amenityFeature: NEGOCIO.comodidades.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    sameAs: [NEGOCIO.instagram, NEGOCIO.linktree],
  };
}

export function faqJsonLd(faq: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.pergunta, acceptedAnswer: { "@type": "Answer", text: f.resposta } })),
  };
}

export function menuJsonLd(nome: string, url: string, secoes: { nome: string; itens: Pick<Produto, "nome" | "descricao" | "preco">[] }[], mostrarPreco: boolean) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: nome,
    url: `${SITE_URL}${url}`,
    inLanguage: "pt-BR",
    provider: { "@id": ID },
    hasMenuSection: secoes.map((s) => ({
      "@type": "MenuSection",
      name: s.nome,
      hasMenuItem: s.itens.map((i) => ({
        "@type": "MenuItem",
        name: i.nome,
        ...(i.descricao ? { description: i.descricao } : {}),
        ...(mostrarPreco && i.preco != null ? { offers: { "@type": "Offer", price: i.preco.toFixed(2), priceCurrency: "BRL" } } : {}),
      })),
    })),
  };
}

export function breadcrumbJsonLd(itens: { nome: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.nome, item: `${SITE_URL}${i.url}` })),
  };
}

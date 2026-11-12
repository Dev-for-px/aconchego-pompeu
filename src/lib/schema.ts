// JSON-LD (schema.org) — ajuda Google e IAs a entenderem o restaurante.
import { NEGOCIO, SITE_URL } from "./site";
import type { Faq, Post, Produto } from "./dados";
import { redesAtivas, type Redes } from "./redes";

const ID = `${SITE_URL}/#restaurante`;

export function restauranteJsonLd(redes: Redes = {}) {
  return {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "@id": ID,
    name: NEGOCIO.nome,
    alternateName: [NEGOCIO.nomeEstendido, "Aconchego Pompéu", "Bar Aconchego", "Choperia Aconchego"],
    url: SITE_URL,
    telephone: `+${NEGOCIO.telefone}`,
    image: `${SITE_URL}/opengraph-image`,
    foundingDate: String(NEGOCIO.desde),
    servesCuisine: ["Pizza", "Comida brasileira", "Churrasco", "Comida caseira", "Petiscos", "Crepes"],
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
    sameAs: [...new Set([NEGOCIO.instagram, NEGOCIO.linktree, ...redesAtivas(redes).map((r) => r.url)])],
  };
}

export function faqJsonLd(faq: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.pergunta, acceptedAnswer: { "@type": "Answer", text: f.resposta } })),
  };
}

export function menuJsonLd(nome: string, url: string, secoes: { nome: string; itens: (Pick<Produto, "nome" | "descricao" | "preco"> & { variacoes?: Produto["variacoes"] })[] }[], mostrarPreco: boolean) {
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
        ...(mostrarPreco ? ofertas(i.preco, i.variacoes ?? []) : {}),
      })),
    })),
  };
}

function ofertas(preco: number | null, variacoes: Produto["variacoes"]) {
  const v = variacoes.filter((x) => x.preco != null) as { nome: string; preco: number }[];
  if (v.length > 1) {
    const ps = v.map((x) => x.preco);
    return { offers: { "@type": "AggregateOffer", lowPrice: Math.min(...ps).toFixed(2), highPrice: Math.max(...ps).toFixed(2), priceCurrency: "BRL", offerCount: v.length } };
  }
  const unico = v[0]?.preco ?? preco;
  return unico != null ? { offers: { "@type": "Offer", price: unico.toFixed(2), priceCurrency: "BRL" } } : {};
}

export function breadcrumbJsonLd(itens: { nome: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.nome, item: `${SITE_URL}${i.url}` })),
  };
}

export function artigoJsonLd(p: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.titulo,
    description: p.resumo ?? undefined,
    image: p.capa_url ?? `${SITE_URL}/opengraph-image`,
    datePublished: p.publicado_em,
    dateModified: p.atualizado_em,
    url: `${SITE_URL}/novidades/${p.slug}`,
    author: { "@id": ID },
    publisher: { "@id": ID },
    inLanguage: "pt-BR",
  };
}

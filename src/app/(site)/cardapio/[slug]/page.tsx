import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ListaCardapio } from "@/components/ListaCardapio";
import { getCardapio, getCategorias, getConfig } from "@/lib/dados";
import { breadcrumbJsonLd, menuJsonLd } from "@/lib/schema";

// Textos de SEO por categoria (palavras-chave de docs/pesquisa-seo.md)
const SEO: Record<string, { h1: string; desc: string }> = {
  pizzas: { h1: "Pizzaria em Pompéu – MG: pizzas do Aconchego", desc: "Pizzas do Aconchego, pizzaria no centro de Pompéu – MG. Meio a meio, delivery e retirada. Peça pelo WhatsApp (37) 99994-3111." },
  "porcoes-na-chapa": { h1: "Porções na chapa e picanha em Pompéu – MG", desc: "Porção de picanha na chapa e outras porções do Aconchego, churrascaria e choperia em Pompéu – MG." },
  bebidas: { h1: "Chopp e bebidas em Pompéu – MG", desc: "Chopp gelado e bebidas na choperia do Aconchego, no centro de Pompéu – MG." },
  petiscos: { h1: "Petiscos em Pompéu – MG", desc: "Petiscos para acompanhar o chopp no Aconchego, em Pompéu – MG." },
  "self-service": { h1: "Self-service e almoço em Pompéu – MG", desc: "Self-service de comida caseira e churrasco no almoço do Aconchego, todos os dias das 11h às 15h, em Pompéu – MG." },
  marmitex: { h1: "Marmitex em Pompéu – MG", desc: "Marmitex do Aconchego para entrega e retirada em Pompéu – MG. Peça pelo WhatsApp." },
};

export async function generateStaticParams() {
  const cats = await getCategorias();
  const slugs = cats.length ? cats.map((c) => c.slug) : Object.keys(SEO);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/cardapio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategorias()).find((c) => c.slug === slug);
  const seo = SEO[slug];
  return {
    title: seo?.h1 ?? `${cat?.nome ?? "Cardápio"} em Pompéu – MG`,
    description: seo?.desc ?? `${cat?.nome ?? "Cardápio"} do Restaurante e Pizzaria Aconchego, em Pompéu – MG.`,
    alternates: { canonical: `/cardapio/${slug}` },
  };
}

export default async function CategoriaPage({ params }: PageProps<"/cardapio/[slug]">) {
  const { slug } = await params;
  const [secoes, config] = await Promise.all([getCardapio(), getConfig()]);
  const secao = secoes.find((s) => s.slug === slug);
  if (!secao) notFound();
  const h1 = SEO[slug]?.h1 ?? `${secao.nome} em Pompéu – MG`;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Cardápio", url: "/cardapio" }, { nome: secao.nome, url: `/cardapio/${slug}` }])} />
      <JsonLd data={menuJsonLd(secao.nome, `/cardapio/${slug}`, [{ nome: secao.nome, itens: secao.produtos }], config.mostrar_precos)} />
      <nav aria-label="Você está em" className="text-sm text-muted"><Link href="/cardapio" className="underline">Cardápio</Link> / {secao.nome}</nav>
      <h1 className="mt-2 text-4xl font-bold">{h1}</h1>
      {secao.descricao && <p className="mt-3 max-w-2xl text-lg text-muted">{secao.descricao}</p>}
      <div className="mt-8"><ListaCardapio secoes={[{ ...secao, nome: "Opções" }]} mostrarPreco={config.mostrar_precos} linkCategoria={false} /></div>
      <p className="mt-10 text-muted">Veja também: {secoes.filter((s) => s.slug !== slug).map((s, i) => (
        <span key={s.id}>{i > 0 && " · "}<Link href={`/cardapio/${s.slug}`} className="text-vinho-500 underline">{s.nome}</Link></span>
      ))}</p>
    </div>
  );
}

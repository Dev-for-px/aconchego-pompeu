import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { CardapioComBebidas } from "@/components/CardapioComBebidas";
import { getCardapio, getConfig } from "@/lib/dados";
import { breadcrumbJsonLd, menuJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Cardápio – pizzas, porções na chapa, chopp e almoço",
  description: "Cardápio do Restaurante e Pizzaria Aconchego em Pompéu – MG: pizzas, porção de picanha na chapa, petiscos, chopp, bebidas e almoço caseiro. Peça pelo WhatsApp.",
  alternates: { canonical: "/cardapio" },
};

export default async function Cardapio() {
  const [secoes, config] = await Promise.all([getCardapio(), getConfig()]);
  const noite = secoes.filter((s) => s.turno !== "almoco");
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Cardápio", url: "/cardapio" }])} />
      <JsonLd data={menuJsonLd("Cardápio da pizzaria e choperia", "/cardapio", noite.map((s) => ({ nome: s.nome, itens: s.produtos })), config.mostrar_precos)} />
      <h1 className="text-4xl font-bold">Cardápio da Pizzaria e Choperia Aconchego</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        À noite, de terça a domingo, das 18h à meia-noite. Procurando o almoço? Veja o <Link href="/almoco-hoje" className="font-semibold text-vinho-500 underline">almoço de hoje</Link>.
      </p>
      <div className="mt-8"><CardapioComBebidas secoes={noite} mostrarPreco={config.mostrar_precos} /></div>
    </div>
  );
}

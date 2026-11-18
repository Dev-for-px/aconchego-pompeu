import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { CardapioComBebidas, ehBebida } from "@/components/CardapioComBebidas";
import { getCardapio, getConfig } from "@/lib/dados";
import { breadcrumbJsonLd, menuJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Bebidas – chopp, cervejas, sucos e refrigerantes",
  description: "Bebidas do Restaurante e Pizzaria Aconchego em Pompéu – MG: chopp gelado, cervejas, drinks, sucos e refrigerantes. No almoço e à noite, com entrega pelo WhatsApp.",
  alternates: { canonical: "/bebidas" },
};

export default async function Bebidas() {
  const [secoes, config] = await Promise.all([getCardapio(), getConfig()]);
  const bebidas = secoes.filter((s) => ehBebida(s.slug));
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Bebidas", url: "/bebidas" }])} />
      <JsonLd data={menuJsonLd("Bebidas", "/bebidas", bebidas.map((s) => ({ nome: s.nome, itens: s.produtos })), config.mostrar_precos)} />
      <h1 className="text-4xl font-bold">Bebidas do Aconchego</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Refrigerantes, sucos, chopp gelado e drinks, no almoço e à noite. Junte com seu pedido do{" "}
        <Link href="/almoco-hoje" className="font-semibold text-vinho-500 underline">almoço</Link> ou da{" "}
        <Link href="/cardapio" className="font-semibold text-vinho-500 underline">pizzaria</Link>.
      </p>
      <div className="mt-8"><CardapioComBebidas secoes={bebidas} mostrarPreco={config.mostrar_precos} linkCategoria={false} /></div>
    </div>
  );
}

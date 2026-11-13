import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { BotaoWhatsApp } from "@/components/Botoes";
import { getConfig } from "@/lib/dados";
import { breadcrumbJsonLd } from "@/lib/schema";
import { ENDERECO_LINHA, NEGOCIO } from "@/lib/site";
import { textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: "Sobre o Aconchego – restaurante e pizzaria desde 2010",
  description: "Conheça o Restaurante e Pizzaria Aconchego, no centro de Pompéu – MG desde 2010: almoço caseiro, churrasco, pizzaria e choperia.",
  alternates: { canonical: "/sobre" },
};

export default async function Sobre() {
  const config = await getConfig();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Sobre", url: "/sobre" }])} />
      <h1 className="text-4xl font-bold">Sobre o Restaurante e Pizzaria Aconchego</h1>
      {config.historia && <p className="mt-4 text-lg text-ink">{config.historia}</p>}
      <h2 className="mt-10 text-2xl font-semibold">O Aconchego em poucas palavras</h2>
      <dl className="mt-4 divide-y divide-linha rounded-md border border-linha bg-creme-50">
        {[
          ["Nome", NEGOCIO.nome],
          ["O que é", "Restaurante, churrascaria e choperia no almoço; bar, pizzaria e choperia à noite (Bar Aconchego)"],
          ["Desde", String(NEGOCIO.desde)],
          ["Endereço", ENDERECO_LINHA],
          ["Almoço", `${textoFaixa(config.horarios.almoco)} – self-service, churrasco, à la carte, marmitex e chopp`],
          ["Noite", `${textoFaixa(config.horarios.jantar)} – bar, pizzas, crepes, porções na chapa e chopp`],
          ["Carros-chefes", "Pizza, porção de picanha na chapa e self-service"],
          ["Serviços", "Delivery próprio e pelo Aiqfome, retirada, reservas e eventos"],
          ["Estrutura", NEGOCIO.comodidades.join(", ")],
          ["Pagamento", config.formas_pagamento.join(", ")],
        ].map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 md:grid-cols-3"><dt className="font-semibold">{k}</dt><dd className="text-muted md:col-span-2">{v}</dd></div>
        ))}
      </dl>
      <div className="mt-8"><BotaoWhatsApp texto="Falar com o Aconchego" /></div>
    </div>
  );
}

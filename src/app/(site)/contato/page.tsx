import type { Metadata } from "next";
import { BotaoWhatsApp } from "@/components/Botoes";
import { InfoCasa } from "@/components/InfoCasa";
import { JsonLd } from "@/components/JsonLd";
import { getConfig } from "@/lib/dados";
import { breadcrumbJsonLd } from "@/lib/schema";
import { NEGOCIO, formatarTelefone } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato, endereço e como chegar",
  description: "Endereço, telefone, WhatsApp e horário do Restaurante e Pizzaria Aconchego: Praça Carlos Elói, 542, Centro, Pompéu – MG.",
  alternates: { canonical: "/contato" },
};

export default async function Contato() {
  const config = await getConfig();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Contato", url: "/contato" }])} />
      <h1 className="text-4xl font-bold">Contato e como chegar ao Aconchego</h1>
      <p className="mt-3 text-lg text-muted">
        Ligue <a href={`tel:+${NEGOCIO.telefone}`} className="font-semibold text-vinho-500 underline">{formatarTelefone(NEGOCIO.telefone)}</a> ou chame no WhatsApp {formatarTelefone(NEGOCIO.whatsapp)} para pedidos, reservas e eventos.
      </p>
      <div className="mt-4"><BotaoWhatsApp /></div>
      <div className="mt-10"><InfoCasa formasPagamento={config.formas_pagamento} horarios={config.horarios} /></div>
    </div>
  );
}

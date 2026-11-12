import type { Metadata } from "next";
import { Checkout } from "@/components/Checkout";
import { getConfig } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Seu pedido",
  robots: { index: false, follow: true },
  alternates: { canonical: "/pedido" },
};

export default async function Pedido() {
  const config = await getConfig();
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">Seu pedido</h1>
      <p className="mt-2 text-muted">Confira os itens e envie. A mensagem chega pronta no WhatsApp do Aconchego.</p>
      <div className="mt-6"><Checkout formasPagamento={config.formas_pagamento} /></div>
    </div>
  );
}

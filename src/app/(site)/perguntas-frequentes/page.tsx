import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ListaFaq } from "@/components/ListaFaq";
import { getFaq } from "@/lib/dados";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Perguntas frequentes – horário, delivery, pagamento",
  description: "Horário, delivery, formas de pagamento, reservas e mais sobre o Restaurante e Pizzaria Aconchego em Pompéu – MG.",
  alternates: { canonical: "/perguntas-frequentes" },
};

export default async function Perguntas() {
  const faq = await getFaq();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Perguntas frequentes", url: "/perguntas-frequentes" }])} />
      <h1 className="text-4xl font-bold">Perguntas frequentes sobre o Aconchego</h1>
      <div className="mt-8"><ListaFaq faq={faq} nivel={2} /></div>
    </div>
  );
}

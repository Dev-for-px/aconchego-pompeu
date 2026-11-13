import type { Metadata } from "next";
import { AlmocoDoDia } from "@/components/AlmocoDoDia";
import { JsonLd } from "@/components/JsonLd";
import { getAlmocoHoje, getConfig } from "@/lib/dados";
import { breadcrumbJsonLd, menuJsonLd } from "@/lib/schema";
import { textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: "Almoço de hoje – self-service, churrasco e marmitex",
  description: "Cardápio do almoço de hoje no Restaurante Aconchego, centro de Pompéu – MG. Self-service de comida caseira, churrasco e marmitex, todos os dias das 11h às 15h.",
  alternates: { canonical: "/almoco-hoje" },
};

export default async function AlmocoHoje() {
  const [almoco, config] = await Promise.all([getAlmocoHoje(), getConfig()]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Almoço de hoje", url: "/almoco-hoje" }])} />
      {almoco && (
        <JsonLd data={{
          ...menuJsonLd("Almoço do dia", "/almoco-hoje", almoco.itens.map((s) => ({ nome: s.secao, itens: s.itens.map((i) => ({ nome: i.nome, descricao: null, preco: i.preco ?? null })) })), config.mostrar_precos),
          dateModified: almoco.atualizado_em,
        }} />
      )}
      <h1 className="text-4xl font-bold">Almoço de hoje no Restaurante Aconchego – Pompéu/MG</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        {textoFaixa(config.horarios.almoco)}: self-service de comida caseira, churrasco, à la carte e marmitex para entrega ou retirada. O cardápio muda todo dia.
      </p>
      <div className="mt-8"><AlmocoDoDia almoco={almoco} mostrarPreco={config.mostrar_precos} horarios={config.horarios} /></div>
    </div>
  );
}

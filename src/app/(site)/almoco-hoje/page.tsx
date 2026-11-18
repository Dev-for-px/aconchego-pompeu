import type { Metadata } from "next";
import { AlmocoDoDia } from "@/components/AlmocoDoDia";
import { JsonLd } from "@/components/JsonLd";
import { GaleriaFaixa } from "@/components/GaleriaFaixa";
import { getAlmocoHoje, getConfig, getGaleria, getMarmitas } from "@/lib/dados";
import { breadcrumbJsonLd, menuJsonLd } from "@/lib/schema";
import { hora, textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: "Almoço de hoje – self-service, churrasco e marmitex",
  description: "Cardápio do almoço de hoje no Restaurante Aconchego, centro de Pompéu – MG. Self-service de comida caseira, churrasco e marmitex, todos os dias das 11h às 15h.",
  alternates: { canonical: "/almoco-hoje" },
};

export default async function AlmocoHoje() {
  const [almoco, config, marmitas, fotos] = await Promise.all([getAlmocoHoje(), getConfig(), getMarmitas(), getGaleria()]);
  const fotosAlmoco = fotos.filter((f) => f.turno !== "noite");
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Almoço de hoje", url: "/almoco-hoje" }])} />
      {almoco && (
        <JsonLd data={{
          ...menuJsonLd("Almoço do dia", "/almoco-hoje", almoco.itens.map((s) => ({ nome: s.secao, itens: s.itens.map((i) => ({ nome: i.nome, descricao: null, preco: i.preco ?? null })) })), config.mostrar_precos),
          dateModified: almoco.atualizado_em,
        }} />
      )}
      {/* Topo curto: o foco é pedir o marmitex logo na primeira tela do celular */}
      <h1 className="text-2xl font-bold leading-tight md:text-4xl">Almoço de hoje</h1>
      <p className="mt-0.5 text-sm text-muted md:text-base">Aconchego · Pompéu – MG · {hora(config.horarios.almoco.inicio)} às {hora(config.horarios.almoco.fim)}</p>
      <div className="mt-3 md:mt-6"><AlmocoDoDia almoco={almoco} mostrarPreco={config.mostrar_precos} horarios={config.horarios} marmitas={marmitas} /></div>
      {fotosAlmoco.length > 0 && <div className="-mx-4 mt-6"><GaleriaFaixa fotos={fotosAlmoco} titulo="Fotos do almoço" /></div>}
      {/* Texto completo (bom para o Google) fica embaixo, depois do pedido */}
      <section aria-labelledby="t-sobre-almoco" className="mt-10 max-w-2xl">
        <p className="font-script text-2xl leading-none text-vinho-500 md:text-3xl">Comida caseira, feita com carinho</p>
        <h2 id="t-sobre-almoco" className="mt-1 text-xl font-semibold">Almoço no Restaurante Aconchego, centro de Pompéu</h2>
        <p className="mt-2 text-[15px] text-muted md:text-lg">
          {textoFaixa(config.horarios.almoco)}. Marmitex para entrega ou retirada, e self-service de comida caseira com churrasco aqui na casa. O cardápio muda todo dia.
        </p>
      </section>
    </div>
  );
}

// Página de SEO local ("pizzaria em Pompéu", "almoço em Pompéu"...).
// Não aparece no menu: existe para quem chega pelo Google/IA e leva direto ao cardápio.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BotaoWhatsApp } from "@/components/Botoes";
import { getCardapio, getConfig, getGaleria, type Faq } from "@/lib/dados";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";
import { ENDERECO_LINHA, NEGOCIO } from "@/lib/site";
import { textoFaixa } from "@/lib/horario";

export type Bloco = { titulo: string; texto: string };

import { PAGINAS_LOCAIS as PAGINAS } from "@/lib/paginasLocais";

export async function PaginaLocal(p: {
  url: string; nome: string; h1: string; intro: string[]; blocos: Bloco[];
  turno: "almoco" | "noite" | "ambos"; categorias?: string[]; tituloItens?: string;
  faq: (cfg: Awaited<ReturnType<typeof getConfig>>) => Omit<Faq, "id">[];
  cta: { texto: string; href: string }; mensagem: string;
}) {
  const [config, cardapio, galeria] = await Promise.all([getConfig(), getCardapio(), getGaleria()]);
  const h = config.horarios;
  const itens = p.categorias
    ? cardapio.filter((c) => p.categorias!.includes(c.slug)).flatMap((c) => c.produtos.filter((x) => x.disponivel).map((x) => x.nome)).slice(0, 18)
    : [];
  const fotos = galeria.filter((f) => p.turno === "ambos" || !f.turno || f.turno === "ambos" || f.turno === p.turno).slice(0, 4);
  const faq = p.faq(config).map((f, i) => ({ ...f, id: String(i) }));
  const horario = p.turno === "noite" ? `Noite: ${textoFaixa(h.jantar)}` : p.turno === "almoco" ? `Almoço: ${textoFaixa(h.almoco)}` : `Almoço: ${textoFaixa(h.almoco)} · Noite: ${textoFaixa(h.jantar)}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: p.nome, url: p.url }])} />
      <JsonLd data={faqJsonLd(faq)} />
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">{p.h1}</h1>
      {p.intro.map((t) => <p key={t} className="mt-4 text-lg text-ink">{t}</p>)}

      <ul className="mt-5 space-y-2 rounded-md border border-linha bg-creme-50 p-4 text-ink">
        <li className="flex gap-2"><Clock size={20} className="shrink-0 text-vinho-700" aria-hidden />{horario}</li>
        <li className="flex gap-2"><MapPin size={20} className="shrink-0 text-vinho-700" aria-hidden />{ENDERECO_LINHA} ({NEGOCIO.endereco.referencia})</li>
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={p.cta.href} className="inline-flex items-center justify-center gap-2 rounded-pill bg-vinho-700 px-6 py-3 font-semibold text-creme-50 hover:bg-vinho-800">
          {p.cta.texto}<ArrowRight size={20} aria-hidden />
        </Link>
        <BotaoWhatsApp texto="Pedir no WhatsApp" mensagem={p.mensagem} />
      </div>

      {fotos.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-2">
          {fotos.map((f) => (
            <Image key={f.id} src={f.url} alt={f.legenda || `${p.nome} – Aconchego`} width={400} height={400} className="aspect-square w-full rounded-md object-cover" sizes="(max-width: 768px) 50vw, 380px" />
          ))}
        </div>
      )}

      {p.blocos.map((b) => (
        <section key={b.titulo} className="mt-8">
          <h2 className="text-2xl font-semibold">{b.titulo}</h2>
          <p className="mt-2 text-ink">{b.texto}</p>
        </section>
      ))}

      {itens.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold">{p.tituloItens ?? "Alguns itens do cardápio"}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {itens.map((n) => <li key={n} className="rounded-pill border border-linha bg-creme-50 px-3 py-1 text-sm">{n}</li>)}
          </ul>
          <Link href={p.cta.href} className="mt-3 inline-block font-semibold text-vinho-700 underline">Ver o cardápio completo</Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Perguntas frequentes</h2>
        <div className="mt-3 divide-y divide-linha rounded-md border border-linha">
          {faq.map((f) => (
            <details key={f.id} className="group p-4">
              <summary className="cursor-pointer font-semibold">{f.pergunta}</summary>
              <p className="mt-2 text-muted">{f.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <nav className="mt-10 text-sm text-muted" aria-label="Outras páginas">
        <p className="font-semibold">O Aconchego em Pompéu:</p>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {PAGINAS.filter((x) => x.url !== p.url).map((x) => <Link key={x.url} href={x.url} className="underline">{x.nome}</Link>)}
          <Link href="/cardapio" className="underline">Cardápio completo</Link>
        </p>
      </nav>
    </article>
  );
}

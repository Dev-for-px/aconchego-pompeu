"use client";
import { useEffect, useMemo, useState } from "react";
import { Copy, MapPin, MessageCircle, MousePointerClick, Phone, Search, Send, ShoppingBag, Users } from "lucide-react";
import { useSessao } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { Ajuda, Titulo } from "./ui";

type Evento = { tipo: string; rotulo: string | null; pagina: string | null; sessao: string | null; criado_em: string };
const PERIODOS = [["1", "Hoje"], ["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"]] as const;

const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });
const fmtHora = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false });
const n = (v: number) => v.toLocaleString("pt-BR");

function contar(lista: (string | null | undefined)[], limite = 8) {
  const m = new Map<string, number>();
  for (const v of lista) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limite);
}

const NOME_PAGINA: Record<string, string> = {
  "/": "Página inicial", "/cardapio": "Cardápio", "/almoco-hoje": "Almoço de hoje", "/pedido": "Página do pedido",
  "/perguntas-frequentes": "Dúvidas", "/sobre": "Sobre", "/contato": "Contato / como chegar", "/novidades": "Novidades",
};
const nomePagina = (p: string) => NOME_PAGINA[p] ?? (p.startsWith("/cardapio/") ? `Cardápio: ${p.split("/")[2].replace(/-/g, " ")}` : p.startsWith("/novidades/") ? `Novidade: ${p.split("/")[2].replace(/-[a-z0-9]{4}$/, "").replace(/-/g, " ")}` : p);

export function Resultados() {
  const { pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [dias, setDias] = useState<string>("7");
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const desde = new Date();
    if (dias === "1") desde.setHours(0, 0, 0, 0); else desde.setDate(desde.getDate() - Number(dias) + 1);
    if (dias !== "1") desde.setHours(0, 0, 0, 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEventos(null);
    // O Supabase entrega no máximo 1.000 linhas por vez: busca em páginas até acabar.
    (async () => {
      const todos: Evento[] = [];
      for (let de = 0; de < 100000; de += 1000) {
        const { data } = await supabase.from("eventos").select("tipo,rotulo,pagina,sessao,criado_em")
          .gte("criado_em", desde.toISOString()).order("criado_em").range(de, de + 999);
        todos.push(...((data as Evento[]) ?? []));
        if (!data || data.length < 1000) break;
      }
      setEventos(todos);
    })();
  }, [supabase, dias]);

  const r = useMemo(() => {
    if (!eventos) return null;
    const de = (t: string) => eventos.filter((e) => e.tipo === t);
    const visitas = de("visita");
    const pessoas = new Set(visitas.map((v) => v.sessao).filter(Boolean)).size;
    const pedidos = de("enviar_pedido").length;
    // série por dia
    const dl: string[] = [];
    const hoje = new Date();
    const total = Number(dias);
    for (let i = total - 1; i >= 0; i--) { const d = new Date(hoje); d.setDate(d.getDate() - i); dl.push(fmtDia.format(d)); }
    const porDia = (lista: Evento[], unico = false) => dl.map((d) => {
      const doDia = lista.filter((e) => fmtDia.format(new Date(e.criado_em)) === d);
      return unico ? new Set(doDia.map((e) => e.sessao)).size : doDia.length;
    });
    const contatos = eventos.filter((e) => ["enviar_pedido", "whatsapp", "ligar"].includes(e.tipo));
    const horas = Array.from({ length: 24 }, (_, h) => contatos.filter((e) => Number(fmtHora.format(new Date(e.criado_em))) % 24 === h).length);
    return {
      pessoas, paginas: visitas.length, pedidos,
      whatsapp: de("whatsapp").length, ligar: de("ligar").length, chegar: de("como_chegar").length,
      redes: de("rede").length, adicionados: de("add_carrinho").length, buscas: de("busca").length,
      taxa: pessoas ? (pedidos / pessoas) * 100 : 0,
      dias: dl, visitasDia: porDia(visitas, true), contatosDia: porDia(contatos), horas,
      topProdutos: contar(de("add_carrinho").map((e) => e.rotulo)),
      topBuscas: contar(de("busca").map((e) => e.rotulo)),
      topPaginas: contar(visitas.map((e) => e.pagina && nomePagina(e.pagina))),
      topRedes: contar(de("rede").map((e) => e.rotulo)),
      origemWhats: contar(de("whatsapp").map((e) => `${e.rotulo || "Botão"} (${nomePagina(e.pagina ?? "/")})`), 6),
      abas: contar(de("aba").map((e) => e.rotulo)),
    };
  }, [eventos, dias]);

  if (!pode("dono", "gerente")) return <p className="text-muted">Sem acesso a esta página.</p>;

  function copiarResumo() {
    if (!r) return;
    const periodo = PERIODOS.find(([v]) => v === dias)?.[1].toLowerCase();
    const txt = [
      `📊 *Resultados do site – Aconchego* (${periodo})`,
      ``,
      `👥 ${n(r.pessoas)} pessoas visitaram o site (${n(r.paginas)} páginas vistas)`,
      `🛍️ ${n(r.pedidos)} pedidos enviados pelo site`,
      `💬 ${n(r.whatsapp)} cliques no WhatsApp`,
      `📞 ${n(r.ligar)} cliques para ligar`,
      `📍 ${n(r.chegar)} pediram rota (Como chegar)`,
      `📱 ${n(r.redes)} cliques nas redes sociais`,
      `➕ ${n(r.adicionados)} itens colocados no carrinho`,
      r.topProdutos[0] ? `⭐ Mais pedido: ${r.topProdutos[0][0]}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(txt).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2500); });
  }

  return (
    <>
      <Titulo sub="Quantas pessoas visitaram o site e o que elas fizeram.">Resultados do site</Titulo>
      <Ajuda passos={[
        <>Escolha o período: <b>Hoje</b>, <b>7</b>, <b>30</b> ou <b>90 dias</b>.</>,
        <>Os quadrados mostram os números principais. <b>Pedidos enviados</b> são pedidos montados no site e enviados para o WhatsApp.</>,
        <>Os gráficos mostram os dias com mais visitas e os <b>horários de pico</b> de contato. Use isso para planejar a equipe e as postagens.</>,
        <>Toque em <b>Copiar resumo</b> para mandar os números no WhatsApp.</>,
      ]} dicas={[
        "“Pessoas” conta cada visita uma vez, mesmo que a pessoa abra várias páginas.",
        "Ninguém é identificado: o site não guarda nome nem telefone de quem visita.",
        "Os números começam a contar a partir de hoje (quando a medição foi ligada).",
      ]} />

      <div role="tablist" aria-label="Período" className="mb-5 flex rounded-pill border border-linha bg-creme-200 p-1">
        {PERIODOS.map(([v, t]) => (
          <button key={v} type="button" role="tab" aria-selected={dias === v} onClick={() => setDias(v)}
            className={`flex-1 rounded-pill py-2 text-sm font-semibold ${dias === v ? "bg-vinho-700 text-creme-50" : "text-ink"}`}>{t}</button>
        ))}
      </div>

      {!r ? <p className="py-10 text-center text-muted">Carregando números…</p> : (
        <div className="space-y-8">
          <section aria-label="Números principais" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Numero Icone={Users} rotulo="Pessoas no site" valor={r.pessoas} extra={`${n(r.paginas)} páginas vistas`} />
            <Numero Icone={Send} rotulo="Pedidos enviados" valor={r.pedidos} extra={r.pessoas ? `${r.taxa.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% das pessoas pediram` : "—"} destaque />
            <Numero Icone={MessageCircle} rotulo="Cliques no WhatsApp" valor={r.whatsapp} />
            <Numero Icone={Phone} rotulo="Cliques para ligar" valor={r.ligar} />
            <Numero Icone={MapPin} rotulo="Como chegar" valor={r.chegar} />
            <Numero Icone={MousePointerClick} rotulo="Redes sociais" valor={r.redes} />
            <Numero Icone={ShoppingBag} rotulo="Itens no carrinho" valor={r.adicionados} />
            <Numero Icone={Search} rotulo="Buscas feitas" valor={r.buscas} />
          </section>

          {dias !== "1" && <Barras titulo="Pessoas por dia" rotulos={r.dias.map((d) => d.slice(8, 10) + "/" + d.slice(5, 7))} valores={r.visitasDia} unidade="pessoas" />}
          {dias !== "1" && <Barras titulo="Contatos por dia (pedidos + WhatsApp + ligações)" rotulos={r.dias.map((d) => d.slice(8, 10) + "/" + d.slice(5, 7))} valores={r.contatosDia} unidade="contatos" />}
          <Barras titulo="Horário de pico dos contatos" rotulos={r.horas.map((_, h) => `${h}h`)} valores={r.horas} unidade="contatos" marcarCada={3} />

          <div className="grid gap-6 md:grid-cols-2">
            <Ranking titulo="Pratos mais colocados no carrinho" itens={r.topProdutos} vazio="Ainda ninguém adicionou itens neste período." />
            <Ranking titulo="O que as pessoas mais procuram na busca" itens={r.topBuscas} vazio="Nenhuma busca neste período." />
            <Ranking titulo="Páginas mais vistas" itens={r.topPaginas} vazio="Sem visitas neste período." />
            <Ranking titulo="Redes sociais clicadas" itens={r.topRedes} vazio="Ninguém clicou nas redes neste período." />
            <Ranking titulo="De onde vieram os cliques no WhatsApp" itens={r.origemWhats} vazio="Nenhum clique no WhatsApp neste período." />
            <Ranking titulo="Abas mais tocadas (Almoço x Pizzaria)" itens={r.abas} vazio="Ninguém trocou de aba neste período." />
          </div>

          <button type="button" onClick={copiarResumo} className="flex w-full items-center justify-center gap-2 rounded-pill bg-vinho-700 px-5 py-3.5 font-semibold text-creme-50">
            <Copy size={20} />{copiado ? "Resumo copiado! Cole no WhatsApp" : "Copiar resumo para enviar"}
          </button>
        </div>
      )}
    </>
  );
}

function Numero({ Icone, rotulo, valor, extra, destaque }: { Icone: typeof Users; rotulo: string; valor: number; extra?: string; destaque?: boolean }) {
  return (
    <div className={`rounded-md border p-4 ${destaque ? "border-vinho-700 bg-vinho-700 text-creme-50" : "border-linha bg-creme-50"}`}>
      <p className={`flex items-center gap-1.5 text-xs font-semibold ${destaque ? "" : "text-muted"}`}><Icone size={16} aria-hidden />{rotulo}</p>
      <p className="mt-1 font-serif text-3xl font-bold">{n(valor)}</p>
      {extra && <p className={`text-xs ${destaque ? "opacity-85" : "text-muted"}`}>{extra}</p>}
    </div>
  );
}

/** Gráfico de barras simples, uma cor, com valor ao tocar/passar o mouse e tabela para leitores de tela. */
function Barras({ titulo, rotulos, valores, unidade, marcarCada }: { titulo: string; rotulos: string[]; valores: number[]; unidade: string; marcarCada?: number }) {
  const [ativo, setAtivo] = useState<number | null>(null);
  const max = Math.max(1, ...valores);
  const passo = marcarCada ?? Math.ceil(rotulos.length / 8);
  const total = valores.reduce((a, b) => a + b, 0);
  return (
    <section className="rounded-md border border-linha bg-creme-50 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-sans text-base font-semibold text-ink">{titulo}</h2>
        <p className="text-sm text-muted" aria-live="polite">{ativo != null ? `${rotulos[ativo]}: ${n(valores[ativo])} ${unidade}` : `Total: ${n(total)}`}</p>
      </div>
      <div className="mt-4 flex h-36 items-end gap-[2px]" onMouseLeave={() => setAtivo(null)} aria-hidden>
        {valores.map((v, i) => (
          <button key={i} type="button" tabIndex={-1} onMouseEnter={() => setAtivo(i)} onClick={() => setAtivo(i)}
            className="group flex h-full flex-1 items-end" title={`${rotulos[i]}: ${n(v)} ${unidade}`}>
            <span className={`block w-full rounded-t-[4px] transition-colors ${ativo === i ? "bg-vinho-800" : "bg-vinho-500"}`}
              style={{ height: v ? `${Math.max(3, (v / max) * 100)}%` : "2px", opacity: v ? 1 : 0.25 }} />
          </button>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px] border-t border-linha pt-1 text-[10px] text-muted" aria-hidden>
        {rotulos.map((r, i) => <span key={i} className="flex-1 text-center">{i % passo === 0 ? r : ""}</span>)}
      </div>
      <table className="sr-only"><caption>{titulo}</caption><tbody>{rotulos.map((r, i) => <tr key={i}><th>{r}</th><td>{valores[i]}</td></tr>)}</tbody></table>
    </section>
  );
}

function Ranking({ titulo, itens, vazio }: { titulo: string; itens: [string, number][]; vazio: string }) {
  const max = Math.max(1, ...itens.map((i) => i[1]));
  return (
    <section className="rounded-md border border-linha bg-creme-50 p-4">
      <h2 className="font-sans text-base font-semibold text-ink">{titulo}</h2>
      {itens.length === 0 ? <p className="mt-3 text-sm text-muted">{vazio}</p> : (
        <ol className="mt-3 space-y-2.5">
          {itens.map(([nome, v]) => (
            <li key={nome}>
              <div className="flex justify-between gap-3 text-sm"><span className="truncate text-ink">{nome}</span><span className="shrink-0 font-semibold text-ink">{n(v)}</span></div>
              <div className="mt-1 h-2 rounded-pill bg-creme-200"><div className="h-2 rounded-pill bg-vinho-500" style={{ width: `${(v / max) * 100}%` }} /></div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

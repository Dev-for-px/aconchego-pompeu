"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { formatarPreco } from "@/lib/site";
import { registrar } from "@/lib/rastreio";
import { BotaoAdicionar, type ProdutoPedido } from "./BotaoAdicionar";

export type ItemBusca = { p: ProdutoPedido; categoria: string; precoMin: number | null; varios: boolean; sabores: ProdutoPedido[] };

const normal = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const SUGESTOES = ["Pizza", "Picanha", "Chopp", "Crepe", "Calabresa", "Fritas"];

/** Barra de pesquisa do cardápio: digita e já aparece o prato com o botão Adicionar. */
export function Busca({ itens, mostrarPreco, clara = false }: { itens: ItemBusca[]; mostrarPreco: boolean; clara?: boolean }) {
  const [aberta, setAberta] = useState(false);
  const [q, setQ] = useState("");
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberta) return;
    campo.current?.focus();
    const o = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberta(false);
    document.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = o; document.removeEventListener("keydown", esc); };
  }, [aberta]);

  // Guarda o que as pessoas procuram (depois de 1,5 s sem digitar)
  useEffect(() => {
    const termo = q.trim();
    if (termo.length < 3) return;
    const t = setTimeout(() => registrar("busca", termo.toLowerCase()), 1500);
    return () => clearTimeout(t);
  }, [q]);

  const resultados = useMemo(() => {
    const termos = normal(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return [];
    return itens
      .filter((i) => { const t = normal(`${i.p.nome} ${i.p.descricao ?? ""} ${i.categoria}`); return termos.every((x) => t.includes(x)); })
      .sort((a, b) => Number(normal(b.p.nome).includes(termos[0])) - Number(normal(a.p.nome).includes(termos[0])))
      .slice(0, 30);
  }, [q, itens]);

  return (
    <>
      <button type="button" onClick={() => setAberta(true)}
        className={`flex w-full items-center gap-3 rounded-pill px-5 py-3.5 text-left text-base ${clara ? "bg-creme-50 text-muted" : "border border-linha bg-creme-50 text-muted"}`}>
        <Search size={20} className="text-vinho-500" aria-hidden />
        <span className="truncate">Buscar pizza, picanha, chopp…</span>
      </button>

      {aberta && (
        <div role="dialog" aria-modal="true" aria-label="Buscar no cardápio" className="fixed inset-0 z-[75] flex flex-col bg-creme-50 text-left">
          <div className="flex items-center gap-2 border-b border-linha px-3 py-3">
            <Search size={22} className="ml-1 shrink-0 text-vinho-500" aria-hidden />
            <input ref={campo} value={q} onChange={(e) => setQ(e.target.value)} type="search" enterKeyHint="search" placeholder="O que você quer comer?"
              aria-label="Buscar no cardápio" className="min-w-0 flex-1 bg-transparent py-2 text-lg text-ink outline-none" />
            <button type="button" onClick={() => setAberta(false)} aria-label="Fechar busca" className="rounded-pill p-2 text-muted"><X size={26} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!q && (
              <>
                <p className="text-sm font-semibold text-muted">Mais procurados</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUGESTOES.map((s) => <button key={s} type="button" onClick={() => setQ(s)} className="rounded-pill border border-linha bg-creme-200 px-4 py-2 font-semibold text-ink">{s}</button>)}
                </div>
              </>
            )}
            {q && resultados.length === 0 && <p className="mt-6 text-center text-muted">Nada encontrado para “{q}”. Tente outra palavra ou chame no WhatsApp.</p>}
            <ul className="space-y-3">
              {resultados.map((i) => (
                <li key={i.p.id} className="flex items-center gap-3 rounded-md border border-linha bg-creme-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{i.p.nome}</p>
                    <p className="text-xs text-muted">{i.categoria}</p>
                    {mostrarPreco && i.precoMin != null && <p className="text-sm font-bold text-vinho-500">{i.varios ? "a partir de " : ""}{formatarPreco(i.precoMin)}</p>}
                  </div>
                  <BotaoAdicionar produto={i.p} grupo={i.categoria} sabores={i.sabores} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

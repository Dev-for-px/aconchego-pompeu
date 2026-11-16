"use client";
// "Quero um marmitex": o cliente toca no botão, escolhe o tamanho (se houver mais de um),
// marca o que vai na marmita e adiciona. Marcou churrasco → vira "com churrasco" e usa o preço com churrasco.
import { useState } from "react";
import { Check, Flame, Plus, Minus } from "lucide-react";
import { pareceChurrasco } from "@/lib/marmitex";
import { useCarrinho } from "@/lib/carrinho";
import type { SecaoAlmoco } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";

export type TipoMarmita = { id: string; nome: string; descricao: string | null; preco: number | null; precoChurrasco: number | null };

export function MontarMarmita({ tipos, secoes, grupo, mostrarPreco }: { tipos: TipoMarmita[]; secoes: SecaoAlmoco[]; grupo: string; mostrarPreco: boolean }) {
  const { adicionar } = useCarrinho();
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoMarmita | null>(tipos.length === 1 ? tipos[0] : null);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [obs, setObs] = useState("");
  const [qtd, setQtd] = useState(1);
  const [feitas, setFeitas] = useState(0);
  const [pronto, setPronto] = useState(false);

  if (tipos.length === 0) return null;

  // Itens de churrasco do dia (marcados no painel; cardápios antigos: pelo nome).
  const deChurrasco = new Set(secoes.flatMap((s) => s.itens.filter((i) => i.churrasco ?? pareceChurrasco(i.nome, s.secao)).map((i) => i.nome)));
  const comChurrasco = marcados.some((n) => deChurrasco.has(n));
  const precoDe = (t: TipoMarmita, churrasco: boolean) => (churrasco ? t.precoChurrasco : t.preco);
  const rotulo = (v: number | null) => (mostrarPreco && v != null ? formatarPreco(v) : null);
  const alternar = (n: string) => setMarcados((m) => (m.includes(n) ? m.filter((x) => x !== n) : [...m, n]));
  const precoAtual = tipo ? precoDe(tipo, comChurrasco) : null;

  function adicionarMarmita() {
    if (!tipo) return;
    const partes = [marcados.length ? `Com: ${marcados.join(", ")}` : "", obs.trim()].filter(Boolean);
    adicionar({ produtoId: tipo.id, nome: comChurrasco ? `${tipo.nome} com churrasco` : tipo.nome, grupo, qtd, precoUnit: precoAtual, adicionais: [], obs: partes.join(". ") });
    setFeitas((f) => f + qtd);
    setPronto(true);
  }

  function outra() {
    setMarcados([]); setObs(""); setQtd(1); setPronto(false);
    if (tipos.length > 1) setTipo(null);
  }

  if (!aberto) {
    const menor = tipos.map((t) => t.preco).filter((p): p is number => p != null).sort((a, b) => a - b)[0];
    return (
      <button type="button" onClick={() => setAberto(true)} data-evento="marmitex" data-rotulo="Quero um marmitex"
        className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-vinho-700 px-6 py-4 text-lg font-semibold text-creme-50 hover:bg-vinho-800">
        Quero um marmitex{mostrarPreco && menor != null && <span className="font-normal opacity-90">· a partir de {formatarPreco(menor)}</span>}
      </button>
    );
  }

  const passoItens = tipos.length > 1 ? 2 : 1;
  return (
    <div className="mt-3 rounded-md border border-linha bg-creme-200 p-4 md:p-6">
      <h3 className="font-serif text-xl font-semibold text-ink">Monte seu marmitex</h3>
      {pronto ? (
        <div className="mt-3 space-y-3">
          <p className="flex items-center gap-2 font-semibold text-aberto"><Check size={20} aria-hidden />Marmitex adicionado ao pedido{feitas > 1 ? ` (${feitas} no total)` : ""}.</p>
          <p className="text-sm text-muted">Para finalizar, toque em “Ver pedido” lá embaixo.</p>
          <button type="button" onClick={outra} className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-vinho-700 px-5 py-3 font-semibold text-vinho-700">
            <Plus size={18} aria-hidden />Montar mais um marmitex
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-5">
          {tipos.length > 1 && (
            <div>
              <p className="font-semibold text-ink">1. Qual marmitex?</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {tipos.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTipo(t)} aria-pressed={tipo?.id === t.id}
                    className={`flex min-h-12 items-center justify-between gap-3 rounded-md border px-4 py-3 text-left ${tipo?.id === t.id ? "border-vinho-700 bg-vinho-700 text-creme-50" : "border-linha bg-creme-50 text-ink"}`}>
                    <span>
                      <span className="block font-semibold">{t.nome}</span>
                      {t.descricao && <span className="block text-sm opacity-80">{t.descricao}</span>}
                    </span>
                    {rotulo(t.preco) && <span className="shrink-0 font-bold">{rotulo(t.preco)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tipo && (
            <>
              <div>
                <p className="font-semibold text-ink">{passoItens}. Toque no que você quer</p>
                {secoes.map((s) => (
                  <fieldset key={s.secao} className="mt-2">
                    {secoes.length > 1 && <legend className="text-sm font-semibold uppercase tracking-wide text-vinho-500">{s.secao}</legend>}
                    <div className="mt-1 flex flex-wrap gap-2">
                      {s.itens.map((i) => {
                        const on = marcados.includes(i.nome);
                        return (
                          <button key={i.nome} type="button" onClick={() => alternar(i.nome)} aria-pressed={on}
                            className={`inline-flex min-h-11 items-center gap-1.5 rounded-pill border px-4 py-2 text-base ${on ? "border-aberto bg-aberto text-creme-50" : "border-linha bg-creme-50 text-ink"}`}>
                            {on ? <Check size={16} aria-hidden /> : deChurrasco.has(i.nome) && <Flame size={16} aria-hidden className="text-vinho-500" />}{i.nome}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
                {comChurrasco && (
                  <p role="status" className="mt-3 flex items-start gap-2 rounded-md bg-dourado px-3 py-2 text-sm font-semibold text-ink">
                    <Flame size={18} aria-hidden className="mt-0.5 shrink-0" />
                    <span>Com churrasco, vira {tipo.nome} com churrasco{rotulo(tipo.precoChurrasco) ? `: ${rotulo(tipo.precoChurrasco)}` : mostrarPreco ? " (valor a confirmar)" : ""}.</span>
                  </p>
                )}
              </div>
              <label className="block">
                <span className="font-semibold text-ink">Alguma observação? <span className="font-normal text-muted">(opcional)</span></span>
                <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: sem cebola, carne bem passada" className="mt-1 w-full rounded-md border border-linha bg-creme-50 px-3 py-3 text-base text-ink" />
              </label>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-ink">Quantos?</span>
                <button type="button" aria-label="Menos" onClick={() => setQtd((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center rounded-pill border border-linha bg-creme-50"><Minus size={18} /></button>
                <span className="w-6 text-center text-lg font-bold">{qtd}</span>
                <button type="button" aria-label="Mais" onClick={() => setQtd((q) => q + 1)} className="flex h-11 w-11 items-center justify-center rounded-pill border border-linha bg-creme-50"><Plus size={18} /></button>
              </div>
              <button type="button" onClick={adicionarMarmita} className="min-h-12 w-full rounded-pill bg-vinho-700 px-6 py-3 text-base font-semibold text-creme-50 hover:bg-vinho-800">
                Adicionar ao pedido{mostrarPreco && precoAtual != null ? ` · ${formatarPreco(precoAtual * qtd)}` : ""}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

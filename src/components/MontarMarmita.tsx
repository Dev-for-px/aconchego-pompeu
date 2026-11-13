"use client";
// "Monte sua marmita": escolhe o tipo, marca o que quer do almoço do dia e adiciona. Pode montar várias.
import { useState } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { useCarrinho } from "@/lib/carrinho";
import type { SecaoAlmoco } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";

export type TipoMarmita = { id: string; nome: string; descricao: string | null; preco: number | null };

export function MontarMarmita({ tipos, secoes, grupo, mostrarPreco }: { tipos: TipoMarmita[]; secoes: SecaoAlmoco[]; grupo: string; mostrarPreco: boolean }) {
  const { adicionar } = useCarrinho();
  const [tipo, setTipo] = useState<TipoMarmita | null>(tipos.length === 1 ? tipos[0] : null);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [obs, setObs] = useState("");
  const [qtd, setQtd] = useState(1);
  const [feitas, setFeitas] = useState(0);
  const [pronto, setPronto] = useState(false);

  if (tipos.length === 0) return null;
  const preco = (t: TipoMarmita) => (mostrarPreco && t.preco != null ? formatarPreco(t.preco) : null);
  const alternar = (n: string) => setMarcados((m) => (m.includes(n) ? m.filter((x) => x !== n) : [...m, n]));

  function adicionarMarmita() {
    if (!tipo) return;
    const partes = [marcados.length ? `Com: ${marcados.join(", ")}` : "", obs.trim()].filter(Boolean);
    adicionar({ produtoId: tipo.id, nome: tipo.nome, grupo, qtd, precoUnit: tipo.preco, adicionais: [], obs: partes.join(". ") });
    setFeitas((f) => f + qtd);
    setPronto(true);
  }

  function outra() {
    setMarcados([]); setObs(""); setQtd(1); setPronto(false);
    if (tipos.length > 1) setTipo(null);
  }

  return (
    <div className="mt-6 rounded-md border border-linha bg-creme-200 p-4 md:p-6">
      <h3 className="font-serif text-xl font-semibold text-ink">Monte sua marmita</h3>
      {pronto ? (
        <div className="mt-3 space-y-3">
          <p className="flex items-center gap-2 font-semibold text-aberto"><Check size={20} aria-hidden />Marmita adicionada ao pedido{feitas > 1 ? ` (${feitas} no total)` : ""}.</p>
          <button type="button" onClick={outra} className="inline-flex items-center gap-2 rounded-pill border border-vinho-700 px-5 py-3 font-semibold text-vinho-700">
            <Plus size={18} aria-hidden />Montar mais uma marmita
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <div>
            <p className="font-semibold text-ink">1. Escolha a marmita</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tipos.map((t) => (
                <button key={t.id} type="button" onClick={() => setTipo(t)} aria-pressed={tipo?.id === t.id}
                  className={`rounded-pill border px-4 py-2 text-left text-[15px] ${tipo?.id === t.id ? "border-vinho-700 bg-vinho-700 text-creme-50" : "border-linha bg-creme-50 text-ink"}`}>
                  {t.nome}{preco(t) && <span className="ml-1 font-bold">· {preco(t)}</span>}
                </button>
              ))}
            </div>
            {tipo?.descricao && <p className="mt-2 text-sm text-muted">{tipo.descricao}</p>}
          </div>
          {tipo && (
            <>
              <div>
                <p className="font-semibold text-ink">2. Marque o que vai na marmita</p>
                {secoes.map((s) => (
                  <fieldset key={s.secao} className="mt-2">
                    <legend className="text-sm font-semibold uppercase tracking-wide text-vinho-500">{s.secao}</legend>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {s.itens.map((i) => {
                        const on = marcados.includes(i.nome);
                        return (
                          <button key={i.nome} type="button" onClick={() => alternar(i.nome)} aria-pressed={on}
                            className={`inline-flex min-h-10 items-center gap-1 rounded-pill border px-3 py-1.5 text-[15px] ${on ? "border-aberto bg-aberto text-creme-50" : "border-linha bg-creme-50 text-ink"}`}>
                            {on && <Check size={16} aria-hidden />}{i.nome}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              <label className="block">
                <span className="font-semibold text-ink">3. Alguma observação? <span className="font-normal text-muted">(opcional)</span></span>
                <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: sem cebola, carne bem passada" className="mt-1 w-full rounded-md border border-linha bg-creme-50 px-3 py-3 text-base text-ink" />
              </label>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-ink">Quantidade</span>
                <button type="button" aria-label="Menos" onClick={() => setQtd((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-pill border border-linha bg-creme-50"><Minus size={18} /></button>
                <span className="w-6 text-center font-bold">{qtd}</span>
                <button type="button" aria-label="Mais" onClick={() => setQtd((q) => q + 1)} className="flex h-10 w-10 items-center justify-center rounded-pill border border-linha bg-creme-50"><Plus size={18} /></button>
              </div>
              <button type="button" onClick={adicionarMarmita} className="w-full rounded-pill bg-vinho-700 px-6 py-3 text-base font-semibold text-creme-50 hover:bg-vinho-800">
                Adicionar marmita ao pedido{preco(tipo) && qtd > 0 ? ` · ${formatarPreco((tipo.preco ?? 0) * qtd)}` : ""}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

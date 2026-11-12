"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useCarrinho } from "@/lib/carrinho";
import { formatarPreco } from "@/lib/site";
import { Quantidade } from "./Quantidade";
import { Sheet } from "./Sheet";

export type ProdutoPedido = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  variacoes: { nome: string; preco: number | null }[];
  meio_a_meio: boolean;
  adicionais: { id: string; nome: string; preco: number | null; preco_por_variacao?: Record<string, number> | null }[];
};

export function BotaoAdicionar({ produto, grupo, sabores = [] }: { produto: ProdutoPedido; grupo: string; sabores?: ProdutoPedido[] }) {
  const { adicionar, config } = useCarrinho();
  const [aberto, setAberto] = useState(false);
  const [qtd, setQtd] = useState(1);
  const [obs, setObs] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [meia, setMeia] = useState<string>("");
  const [tamanho, setTamanho] = useState<string>(produto.variacoes[0]?.nome ?? "");

  const temTamanho = produto.variacoes.length > 0;
  const precoDe = (p: ProdutoPedido) => (temTamanho ? p.variacoes.find((v) => v.nome === tamanho)?.preco ?? null : p.preco);
  const outroSabor = sabores.find((s) => s.id === meia);
  // Meio a meio: vale o maior preço entre os dois sabores no mesmo tamanho (regra comum de pizzaria)
  const precoBase = outroSabor ? (() => { const a = precoDe(produto), b = precoDe(outroSabor); return a != null && b != null ? Math.max(a, b) : null; })() : precoDe(produto);
  const precoAdicional = (a: ProdutoPedido["adicionais"][number]) => a.preco_por_variacao?.[tamanho] ?? a.preco;
  const adicionaisEscolhidos = produto.adicionais.filter((a) => extras.includes(a.id));
  const precoTotal = precoBase == null ? null : (precoBase + adicionaisEscolhidos.reduce((s, a) => s + (precoAdicional(a) ?? 0), 0)) * qtd;

  function confirmar() {
    adicionar({
      produtoId: produto.id,
      nome: (outroSabor ? `Pizza meia ${produto.nome.replace(/^Pizza (de )?/, "")} / meia ${outroSabor.nome.replace(/^Pizza (de )?/, "")}` : produto.nome) + (temTamanho ? ` – ${tamanho}` : ""),
      grupo,
      qtd,
      precoUnit: precoBase,
      adicionais: adicionaisEscolhidos.map((a) => ({ nome: a.nome, preco: precoAdicional(a) })),
      obs,
    });
    setAberto(false);
    setQtd(1);
    setObs("");
    setExtras([]);
    setMeia("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1 rounded-pill bg-vinho-700 px-5 py-2.5 text-sm font-semibold text-creme-50 hover:bg-vinho-800 active:scale-95"
        aria-label={`Adicionar ${produto.nome} ao pedido`}
      >
        <Plus size={18} aria-hidden />Adicionar
      </button>
      <Sheet
        aberto={aberto}
        titulo={produto.nome}
        onFechar={() => setAberto(false)}
        rodape={
          <div className="flex items-center gap-3">
            <Quantidade valor={qtd} onChange={setQtd} />
            <button type="button" onClick={confirmar} className="flex-1 rounded-pill bg-vinho-700 px-5 py-3 text-base font-semibold text-creme-50 hover:bg-vinho-800">
              Adicionar{config.mostrarPrecos && precoTotal != null ? ` · ${formatarPreco(precoTotal)}` : ""}
            </button>
          </div>
        }
      >
        {produto.descricao && <p className="text-muted">{produto.descricao}</p>}

        {temTamanho && (
          <fieldset className="mt-5">
            <legend className="font-semibold text-ink">Escolha o tamanho</legend>
            <div className="mt-2 space-y-2">
              {produto.variacoes.map((v) => (
                <label key={v.nome} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border border-linha bg-creme-50 px-4 py-2 has-[:checked]:border-vinho-700">
                  <span className="flex items-center gap-3">
                    <input type="radio" name={`tam-${produto.id}`} className="h-5 w-5 accent-vinho-700" checked={tamanho === v.nome} onChange={() => setTamanho(v.nome)} />
                    {v.nome}
                  </span>
                  {config.mostrarPrecos && v.preco != null && <span className="text-sm font-semibold text-vinho-500">{formatarPreco(v.preco)}</span>}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {produto.meio_a_meio && sabores.length > 1 && (
          <label className="mt-5 block">
            <span className="font-semibold text-ink">Quer meio a meio? <span className="font-normal text-muted">(cobra o sabor mais caro)</span></span>
            <select value={meia} onChange={(e) => setMeia(e.target.value)} className="mt-2 w-full rounded-md border border-linha bg-creme-50 p-3 text-base outline-none focus:border-vinho-500">
              <option value="">Não, inteira de {produto.nome.replace(/^Pizza (de )?/, "")}</option>
              {sabores.filter((s) => s.id !== produto.id).map((s) => (
                <option key={s.id} value={s.id}>Meia {s.nome.replace(/^Pizza (de )?/, "")}</option>
              ))}
            </select>
          </label>
        )}

        {produto.adicionais.length > 0 && (
          <fieldset className="mt-5">
            <legend className="font-semibold text-ink">Adicionais</legend>
            <div className="mt-2 space-y-2">
              {produto.adicionais.map((a) => (
                <label key={a.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border border-linha bg-creme-50 px-4 py-2">
                  <span className="flex items-center gap-3">
                    <input type="checkbox" className="h-5 w-5 accent-vinho-700" checked={extras.includes(a.id)} onChange={(e) => setExtras((x) => (e.target.checked ? [...x, a.id] : x.filter((i) => i !== a.id)))} />
                    {a.nome}
                  </span>
                  {config.mostrarPrecos && precoAdicional(a) != null && <span className="text-sm font-semibold text-vinho-500">+ {formatarPreco(precoAdicional(a))}</span>}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="mt-5 block">
          <span className="font-semibold text-ink">Alguma observação?</span>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Ex.: sem cebola, bem passado…" className="mt-2 w-full rounded-md border border-linha bg-creme-50 p-3 text-base outline-none focus:border-vinho-500" />
        </label>
      </Sheet>
    </>
  );
}

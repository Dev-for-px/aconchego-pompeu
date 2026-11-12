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
  meio_a_meio: boolean;
  adicionais: { id: string; nome: string; preco: number | null }[];
};

export function BotaoAdicionar({ produto, grupo, sabores = [] }: { produto: ProdutoPedido; grupo: string; sabores?: ProdutoPedido[] }) {
  const { adicionar, config } = useCarrinho();
  const [aberto, setAberto] = useState(false);
  const [qtd, setQtd] = useState(1);
  const [obs, setObs] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [meia, setMeia] = useState<string>("");

  const simples = produto.adicionais.length === 0 && !produto.meio_a_meio;
  const outroSabor = sabores.find((s) => s.id === meia);
  // Meio a meio: vale o maior preço entre os dois sabores (regra comum de pizzaria; ajustável)
  const precoBase = outroSabor && produto.preco != null && outroSabor.preco != null ? Math.max(produto.preco, outroSabor.preco) : outroSabor ? null : produto.preco;
  const adicionaisEscolhidos = produto.adicionais.filter((a) => extras.includes(a.id));
  const precoTotal = precoBase == null ? null : (precoBase + adicionaisEscolhidos.reduce((s, a) => s + (a.preco ?? 0), 0)) * qtd;

  function confirmar() {
    adicionar({
      produtoId: produto.id,
      nome: outroSabor ? `Meia ${produto.nome} / Meia ${outroSabor.nome}` : produto.nome,
      grupo,
      qtd,
      precoUnit: precoBase,
      adicionais: adicionaisEscolhidos.map((a) => ({ nome: a.nome, preco: a.preco })),
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

        {produto.meio_a_meio && sabores.length > 0 && (
          <fieldset className="mt-5">
            <legend className="font-semibold text-ink">Quer meio a meio?</legend>
            <div className="mt-2 space-y-2">
              <Opcao nome="sabor" checked={meia === ""} onChange={() => setMeia("")} texto={`Inteira de ${produto.nome}`} />
              {sabores.filter((s) => s.id !== produto.id).map((s) => (
                <Opcao key={s.id} nome="sabor" checked={meia === s.id} onChange={() => setMeia(s.id)} texto={`Meia ${produto.nome} / Meia ${s.nome}`} />
              ))}
            </div>
          </fieldset>
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
                  {config.mostrarPrecos && a.preco != null && <span className="text-sm font-semibold text-vinho-500">+ {formatarPreco(a.preco)}</span>}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="mt-5 block">
          <span className="font-semibold text-ink">Alguma observação?</span>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Ex.: sem cebola, bem passado…" className="mt-2 w-full rounded-md border border-linha bg-creme-50 p-3 text-base outline-none focus:border-vinho-500" />
        </label>
        {simples && <p className="sr-only">Escolha a quantidade e toque em Adicionar.</p>}
      </Sheet>
    </>
  );
}

function Opcao({ nome, checked, onChange, texto }: { nome: string; checked: boolean; onChange: () => void; texto: string }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-linha bg-creme-50 px-4 py-2">
      <input type="radio" name={nome} className="h-5 w-5 accent-vinho-700" checked={checked} onChange={onChange} />
      {texto}
    </label>
  );
}

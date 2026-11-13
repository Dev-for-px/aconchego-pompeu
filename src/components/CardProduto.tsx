import Image from "next/image";
import { precoMinimo, type Produto } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";
import { BotaoAdicionar, type ProdutoPedido } from "./BotaoAdicionar";

export function paraPedido(p: Produto): ProdutoPedido {
  return { id: p.id, nome: p.nome, descricao: p.descricao, preco: p.preco, variacoes: p.variacoes ?? [], meio_a_meio: p.meio_a_meio, adicionais: p.adicionais ?? [] };
}

export function CardProduto({ p, mostrarPreco, grupo, sabores = [], nivel = 3 }: { p: Produto; mostrarPreco: boolean; grupo: string; sabores?: ProdutoPedido[]; nivel?: 3 | 4 }) {
  const H = nivel === 4 ? "h4" : "h3";
  const min = precoMinimo(p);
  const preco = mostrarPreco && min != null ? formatarPreco(min) : null;
  const aPartir = p.variacoes.length > 1;
  return (
    <article className={`flex gap-4 rounded-md border border-linha bg-creme-50 p-4 ${p.disponivel ? "" : "opacity-60"}`}>
      {p.foto_url ? (
        <Image src={p.foto_url} alt={p.foto_alt || `${p.nome} – Aconchego Pompéu`} width={112} height={112} className="aspect-square h-24 w-24 shrink-0 rounded-md bg-creme-200 object-contain md:h-28 md:w-28" />
      ) : (
        <div aria-hidden className="flex h-24 w-24 md:h-28 md:w-28 shrink-0 items-center justify-center rounded-md bg-creme-200 p-2 text-center font-serif text-base font-semibold leading-tight text-vinho-700">
          {p.nome}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <H className="text-lg font-semibold text-ink">{p.nome}</H>
          {p.destaque && <span className="shrink-0 rounded-sm bg-dourado px-2 py-0.5 text-xs font-semibold text-ink">Destaque</span>}
        </div>
        {p.descricao && <p className="mt-1 line-clamp-3 text-sm text-muted">{p.descricao}</p>}
        {p.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1">
            {p.tags.map((t) => <li key={t} className="rounded-pill border border-linha px-2 py-0.5 text-xs text-muted">{t}</li>)}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="flex flex-col leading-tight">{preco && aPartir && <span className="text-xs text-muted">a partir de</span>}<span className="text-base font-bold whitespace-nowrap text-vinho-500">{preco ?? ""}</span></span>
          {p.disponivel ? (
            <BotaoAdicionar produto={paraPedido(p)} grupo={grupo} sabores={p.meio_a_meio ? sabores : []} />
          ) : (
            <span className="text-sm font-semibold text-muted">Indisponível hoje</span>
          )}
        </div>
      </div>
    </article>
  );
}

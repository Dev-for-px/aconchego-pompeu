import Image from "next/image";
import type { Produto } from "@/lib/dados";
import { formatarPreco, linkWhatsApp } from "@/lib/site";

export function CardProduto({ p, mostrarPreco }: { p: Produto; mostrarPreco: boolean }) {
  const preco = mostrarPreco ? formatarPreco(p.preco) : null;
  return (
    <article className={`flex gap-4 rounded-md border border-linha bg-creme-50 p-4 ${p.disponivel ? "" : "opacity-60"}`}>
      {p.foto_url ? (
        <Image src={p.foto_url} alt={p.foto_alt || `${p.nome} – Aconchego Pompéu`} width={112} height={112} className="h-28 w-28 shrink-0 rounded-md object-cover" />
      ) : (
        <div aria-hidden className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md bg-creme-200 p-2 text-center font-serif text-base font-semibold leading-tight text-vinho-700">
          {p.nome}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-ink">{p.nome}</h3>
          {p.destaque && <span className="shrink-0 rounded-sm bg-dourado px-2 py-0.5 text-xs font-semibold text-ink">Destaque</span>}
        </div>
        {p.descricao && <p className="mt-1 line-clamp-3 text-sm text-muted">{p.descricao}</p>}
        {p.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1">
            {p.tags.map((t) => <li key={t} className="rounded-pill border border-linha px-2 py-0.5 text-xs text-muted">{t}</li>)}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-lg font-bold text-vinho-500">{preco ?? ""}</span>
          {p.disponivel ? (
            <a href={linkWhatsApp(`Olá! Quero pedir: ${p.nome}`)} className="rounded-pill bg-vinho-700 px-5 py-2 text-sm font-semibold text-creme-50 hover:bg-vinho-800">Pedir</a>
          ) : (
            <span className="text-sm font-semibold text-muted">Indisponível hoje</span>
          )}
        </div>
      </div>
    </article>
  );
}

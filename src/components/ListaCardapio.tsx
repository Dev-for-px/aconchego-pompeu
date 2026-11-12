import Link from "next/link";
import type { Categoria, Produto } from "@/lib/dados";
import { CardProduto, paraPedido } from "./CardProduto";
import { BotaoWhatsApp } from "./Botoes";

type Secao = Categoria & { produtos: Produto[]; grupo?: string };

export function ListaCardapio({ secoes, mostrarPreco, nivel = 2, linkCategoria = true }: { secoes: Secao[]; mostrarPreco: boolean; nivel?: 2 | 3; linkCategoria?: boolean }) {
  const comItens = secoes.filter((s) => s.produtos.length > 0);
  if (comItens.length === 0) {
    return (
      <div className="rounded-md border border-linha bg-creme-200 p-6 text-center">
        <p className="text-ink">O cardápio completo está chegando ao site.</p>
        <p className="mt-1 text-sm text-muted">Enquanto isso, chame a gente no WhatsApp que mandamos as opções.</p>
        <div className="mt-4"><BotaoWhatsApp texto="Ver opções no WhatsApp" mensagem="Olá! Pode me mandar o cardápio?" /></div>
      </div>
    );
  }
  const H = nivel === 2 ? "h2" : "h3";
  return (
    <div className="space-y-12">
      <nav aria-label="Categorias" className="sem-barra sticky top-0 z-30 -mx-4 overflow-x-auto bg-creme-50/95 px-4 py-2 backdrop-blur md:top-[72px]">
        <ul className="flex gap-2">
          {comItens.map((s) => (
            <li key={s.id} className="shrink-0"><a href={`#${s.slug}`} className="block rounded-pill border border-linha bg-creme-200 px-4 py-2 text-sm font-semibold text-ink">{s.nome}</a></li>
          ))}
        </ul>
      </nav>
      {comItens.map((s) => (
        <section key={s.id} id={s.slug} aria-labelledby={`t-${s.slug}`} className="scroll-mt-20 md:scroll-mt-36">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <H id={`t-${s.slug}`} className="text-2xl font-semibold text-ink">{s.nome}</H>
            {linkCategoria && <Link href={`/cardapio/${s.slug}`} className="text-sm font-semibold text-vinho-500 underline">Ver página</Link>}
          </div>
          {s.descricao && <p className="mb-4 text-muted">{s.descricao}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {s.produtos.map((p) => <CardProduto key={p.id} p={p} mostrarPreco={mostrarPreco} grupo={s.grupo ?? s.nome} sabores={s.produtos.filter((x) => x.meio_a_meio && x.disponivel).map(paraPedido)} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

import type { Categoria, Produto } from "@/lib/dados";
import { ListaCardapio } from "./ListaCardapio";

type Secao = Categoria & { produtos: Produto[] };
export const ALCOOL = new Set(["cervejas-e-chopp", "drinks", "doses", "whiskys", "vinhos"]);

/** Cardápio com as bebidas alcoólicas recolhidas num bloco "toque para ver". */
export function CardapioComBebidas({ secoes, mostrarPreco, nivel = 2, prefixo = "", linkCategoria = true }: { secoes: Secao[]; mostrarPreco: boolean; nivel?: 2 | 3; prefixo?: string; linkCategoria?: boolean }) {
  const comItens = secoes.filter((c) => c.produtos.length > 0);
  const principal = comItens.filter((c) => !ALCOOL.has(c.slug));
  const alcool = comItens.filter((c) => ALCOOL.has(c.slug));
  return (
    <div className="space-y-10">
      {principal.length > 0 && <ListaCardapio secoes={principal} mostrarPreco={mostrarPreco} nivel={nivel} prefixo={prefixo} linkCategoria={linkCategoria} />}
      {alcool.length > 0 && (
        <details className="group rounded-md border border-linha bg-creme-200">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span>
              <span className="block font-serif text-xl font-semibold">Chopp, cervejas e drinks</span>
              <span className="text-sm text-muted">{alcool.map((c) => c.nome).join(" · ")} — toque para ver</span>
            </span>
            <span aria-hidden className="text-2xl text-vinho-500 transition group-open:rotate-45">+</span>
          </summary>
          <div className="border-t border-linha bg-creme-50 px-4 pb-6 pt-2">
            <ListaCardapio secoes={alcool} mostrarPreco={mostrarPreco} nivel={nivel} prefixo={`${prefixo}b-`} linkCategoria={false} />
            <p className="mt-6 text-sm text-muted">Venda de bebidas alcoólicas proibida para menores de 18 anos.</p>
          </div>
        </details>
      )}
    </div>
  );
}

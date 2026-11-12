"use client";
import { Plus } from "lucide-react";
import { useCarrinho } from "@/lib/carrinho";

export function AdicionarAlmoco({ nome, grupo, preco }: { nome: string; grupo: string; preco: number | null }) {
  const { adicionar } = useCarrinho();
  return (
    <button
      type="button"
      aria-label={`Adicionar ${nome} ao pedido`}
      onClick={() => adicionar({ produtoId: null, nome, grupo, qtd: 1, precoUnit: preco, adicionais: [], obs: "" })}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-linha bg-creme-200 text-vinho-500 active:scale-95"
    >
      <Plus size={18} />
    </button>
  );
}

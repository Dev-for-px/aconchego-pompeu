"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCarrinho } from "@/lib/carrinho";
import { formatarPreco } from "@/lib/site";

// Barra fixa "Ver pedido" (acima da barra Ligar/WhatsApp no celular) + aviso de item adicionado.
export function BarraCarrinho() {
  const { totalItens, subtotal, config, aviso } = useCarrinho();
  const caminho = usePathname();
  if (caminho.startsWith("/admin")) return null;
  return (
    <>
      {aviso && (
        <div role="status" className="fixed inset-x-4 top-4 z-[70] mx-auto max-w-md rounded-pill bg-ink px-4 py-3 text-center text-sm font-semibold text-creme-50">{aviso}</div>
      )}
      {totalItens > 0 && caminho !== "/pedido" && (
        <>
          <div className="h-20" aria-hidden />
          <div className="fixed inset-x-0 bottom-[60px] z-50 px-3 pb-2 md:bottom-4">
            <Link href="/pedido" data-evento="ver_pedido" data-rotulo="Barra Ver pedido" className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-pill bg-vinho-700 px-5 py-3.5 text-creme-50 shadow-md">
              <span className="flex items-center gap-2 font-semibold">
                <ShoppingBag size={22} aria-hidden />
                Ver pedido
                <span className="rounded-pill bg-creme-50 px-2 text-sm font-bold text-vinho-700">{totalItens}</span>
              </span>
              <span className="font-bold">{config.mostrarPrecos && subtotal != null ? formatarPreco(subtotal) : "Enviar no WhatsApp"}</span>
            </Link>
          </div>
        </>
      )}
    </>
  );
}

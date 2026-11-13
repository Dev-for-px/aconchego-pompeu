"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Logo } from "./Logo";
import { ChevronRight, Camera, Clock, Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
import { useCarrinho } from "@/lib/carrinho";
import { NEGOCIO, linkWhatsApp } from "@/lib/site";
import { textoFaixa, type Horarios } from "@/lib/horario";

export function MenuMobile({ links, horarios }: { links: { href: string; label: string }[]; horarios: Horarios }) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();
  const { totalItens } = useCarrinho();

  useEffect(() => {
    if (!aberto) return;
    const o = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = o; };
  }, [aberto]);

  return (
    <div className="flex w-full items-center justify-between md:hidden">
      <Link href="/pedido" data-evento="ver_pedido" data-rotulo="Ícone do topo" aria-label={`Meu pedido${totalItens ? `, ${totalItens} itens` : ""}`} className="relative rounded-pill p-2.5 hover:bg-vinho-800">
        <ShoppingBag size={24} />
        {totalItens > 0 && <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-pill bg-dourado px-1 text-xs font-bold text-ink">{totalItens}</span>}
      </Link>
      <button type="button" onClick={() => setAberto(true)} aria-label="Abrir menu" aria-expanded={aberto} className="rounded-pill p-2.5 hover:bg-vinho-800">
        <Menu size={26} />
      </button>

      {aberto && createPortal(
        <div className="fixed inset-0 z-[80] flex flex-col bg-vinho-700 text-creme-50" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" onClick={() => setAberto(false)} aria-label="Início"><Logo variante="branca" altura={44} /></Link>
            <button type="button" onClick={() => setAberto(false)} aria-label="Fechar menu" className="rounded-pill p-2.5 hover:bg-vinho-800"><X size={28} /></button>
          </div>
          <nav aria-label="Menu" className="flex-1 overflow-y-auto px-6">
            <ul className="divide-y divide-vinho-800">
              <li><Link href="/" onClick={() => setAberto(false)} className={`flex items-center justify-between py-4 font-serif text-2xl ${caminho === "/" ? "font-bold" : ""}`}>Início<ChevronRight size={22} className="opacity-60" /></Link></li>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setAberto(false)} className={`flex items-center justify-between py-4 font-serif text-2xl ${caminho.startsWith(l.href) ? "font-bold" : ""}`}>
                    {l.label}<ChevronRight size={22} className="opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2 text-sm opacity-90"><Clock size={18} className="mt-0.5 shrink-0" />Almoço: {textoFaixa(horarios.almoco).toLowerCase()}<br />Pizzaria: {textoFaixa(horarios.jantar).toLowerCase()}</p>
            <p className="mt-8 font-script text-4xl">Feito com carinho</p>
          </nav>
          <div className="space-y-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <a href={linkWhatsApp("Olá! Vim pelo site do Aconchego.")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-pill bg-aberto py-3.5 text-base font-semibold"><MessageCircle size={22} />Pedir no WhatsApp</a>
            <a href={NEGOCIO.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-pill border border-creme-50/40 py-3 font-semibold"><Camera size={20} />@rest.pizzariaaconchego</a>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

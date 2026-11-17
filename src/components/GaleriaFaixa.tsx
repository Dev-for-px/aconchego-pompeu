"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Foto } from "@/lib/dados";

// Carrossel de fotos: arrasta com o dedo ou usa as setas; ao tocar numa foto, abre grande.
export function GaleriaFaixa({ fotos, titulo = "Fotos do Aconchego" }: { fotos: Foto[]; titulo?: string }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const faixa = useRef<HTMLUListElement>(null);
  const passar = (dir: 1 | -1) => {
    const el = faixa.current;
    if (!el) return;
    const fim = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const inicio = el.scrollLeft <= 4;
    // No fim volta pro começo (e vice-versa), como um carrossel.
    if (dir === 1 && fim) return el.scrollTo({ left: 0, behavior: "smooth" });
    if (dir === -1 && inicio) return el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    const item = el.querySelector("li");
    const passo = item ? item.getBoundingClientRect().width + 8 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * passo, behavior: "smooth" });
  };
  if (fotos.length === 0) return null;
  const atual = aberta != null ? fotos[aberta] : null;
  const alt = (f: Foto) => f.legenda || "Foto do Restaurante e Pizzaria Aconchego, Pompéu – MG";
  return (
    <>
      <div className="relative">
      <ul ref={faixa} aria-label={titulo} className="sem-barra flex snap-x snap-mandatory gap-2 md:gap-3 overflow-x-auto scroll-smooth px-4 pb-1">
        {fotos.map((f, i) => (
          <li key={f.id} className="shrink-0 snap-start first:ml-auto last:mr-auto">
            <button type="button" onClick={() => setAberta(i)} className="block overflow-hidden rounded-md">
              <Image src={f.url} alt={alt(f)} width={320} height={320} sizes="(max-width: 768px) 40vw, 224px" className="aspect-square h-36 w-36 bg-creme-200 object-contain md:h-52 md:w-52" />
            </button>
          </li>
        ))}
      </ul>
      {fotos.length > 2 && (
        <>
          <button type="button" aria-label="Fotos anteriores" onClick={() => passar(-1)} className="absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-pill bg-creme-50/90 text-vinho-700 shadow-sm ring-1 ring-linha md:left-2 md:h-11 md:w-11"><ChevronLeft size={24} /></button>
          <button type="button" aria-label="Próximas fotos" onClick={() => passar(1)} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-pill bg-creme-50/90 text-vinho-700 shadow-sm ring-1 ring-linha md:right-2 md:h-11 md:w-11"><ChevronRight size={24} /></button>
        </>
      )}
      </div>
      {atual && aberta != null && (
        <div role="dialog" aria-modal="true" aria-label={alt(atual)} className="fixed inset-0 z-[90] flex flex-col bg-ink/95 text-creme-50">
          <div className="flex justify-end p-3"><button type="button" onClick={() => setAberta(null)} aria-label="Fechar" className="rounded-pill p-2"><X size={28} /></button></div>
          <div className="relative flex flex-1 items-center justify-center px-2">
            <Image src={atual.url} alt={alt(atual)} width={1200} height={900} sizes="100vw" className="max-h-[75dvh] w-auto rounded-md object-contain" />
            {fotos.length > 1 && (
              <>
                <button type="button" aria-label="Foto anterior" onClick={() => setAberta((aberta - 1 + fotos.length) % fotos.length)} className="absolute left-2 rounded-pill bg-ink/60 p-2"><ChevronLeft size={28} /></button>
                <button type="button" aria-label="Próxima foto" onClick={() => setAberta((aberta + 1) % fotos.length)} className="absolute right-2 rounded-pill bg-ink/60 p-2"><ChevronRight size={28} /></button>
              </>
            )}
          </div>
          {atual.legenda && <p className="p-4 text-center">{atual.legenda}</p>}
        </div>
      )}
    </>
  );
}

"use client";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Foto } from "@/lib/dados";

// Faixa de fotos que rola para o lado; ao tocar, abre a foto grande.
export function GaleriaFaixa({ fotos, titulo = "Fotos do Aconchego" }: { fotos: Foto[]; titulo?: string }) {
  const [aberta, setAberta] = useState<number | null>(null);
  if (fotos.length === 0) return null;
  const atual = aberta != null ? fotos[aberta] : null;
  const alt = (f: Foto) => f.legenda || "Foto do Restaurante e Pizzaria Aconchego, Pompéu – MG";
  return (
    <>
      <ul aria-label={titulo} className="sem-barra flex snap-x gap-2 md:gap-3 overflow-x-auto px-4 pb-1">
        {fotos.map((f, i) => (
          <li key={f.id} className="shrink-0 snap-start first:ml-auto last:mr-auto">
            <button type="button" onClick={() => setAberta(i)} className="block overflow-hidden rounded-md">
              <Image src={f.url} alt={alt(f)} width={320} height={320} sizes="(max-width: 768px) 40vw, 224px" className="aspect-square h-28 w-28 bg-creme-200 object-contain md:h-48 md:w-48" />
            </button>
          </li>
        ))}
      </ul>
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

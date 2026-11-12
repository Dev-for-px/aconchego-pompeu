"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

// Painel que sobe de baixo no celular (e vira janela central no computador).
export function Sheet({ aberto, titulo, onFechar, children, rodape }: { aberto: boolean; titulo: string; onFechar: () => void; children: ReactNode; rodape?: ReactNode }) {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = overflow;
    };
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink/50" onClick={onFechar} />
      <div className="relative flex max-h-[90dvh] w-full flex-col rounded-t-[20px] bg-creme-50 md:max-w-lg md:rounded-md">
        <div className="flex items-center justify-between gap-4 border-b border-linha px-4 py-3">
          <p className="font-serif text-xl font-semibold text-ink">{titulo}</p>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-pill p-2 text-muted hover:bg-creme-200"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {rodape && <div className="border-t border-linha px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{rodape}</div>}
      </div>
    </div>
  );
}

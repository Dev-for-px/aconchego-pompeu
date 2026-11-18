"use client";
// Botão "Instalar app" (PWA). Android/Chrome: abre o convite do próprio navegador.
// iPhone/iPad (Safari): mostra o passo a passo (Compartilhar › Adicionar à Tela de Início).
// Some quando o app já está instalado ou o navegador não permite instalar.
import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { registrar } from "@/lib/rastreio";

type ConviteInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
let convite: ConviteInstalar | null = null;
const avisos = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); convite = e as ConviteInstalar; avisos.forEach((f) => f()); });
  window.addEventListener("appinstalled", () => { convite = null; registrar("clique", "App instalado"); avisos.forEach((f) => f()); });
}

function instalado() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function InstalarApp({ className = "", clara = false }: { className?: string; clara?: boolean }) {
  const [modo, setModo] = useState<"android" | "ios" | null>(null);
  const [ajuda, setAjuda] = useState(false);

  useEffect(() => {
    const atualizar = () => setModo(instalado() ? null : convite ? "android" : ehIOS() ? "ios" : null);
    atualizar();
    avisos.add(atualizar);
    return () => { avisos.delete(atualizar); };
  }, []);

  if (!modo) return null;
  async function instalar() {
    registrar("clique", "Instalar app");
    if (modo === "ios") return setAjuda(true);
    if (!convite) return;
    await convite.prompt();
    await convite.userChoice;
    convite = null;
    setModo(null);
  }
  return (
    <>
      <button type="button" onClick={instalar} data-sem-rastreio
        className={`inline-flex items-center justify-center gap-2 rounded-pill border px-5 py-3 font-semibold ${clara ? "border-creme-50/40 text-creme-50" : "border-linha bg-creme-50 text-ink"} ${className}`}>
        <Download size={20} aria-hidden />Instalar o app no celular
      </button>
      {ajuda && (
        <div role="dialog" aria-modal="true" aria-label="Instalar no iPhone" className="fixed inset-0 z-[95] flex items-end justify-center md:items-center">
          <button type="button" aria-label="Fechar" onClick={() => setAjuda(false)} className="absolute inset-0 bg-ink/50" />
          <div className="relative w-full max-w-md rounded-t-[20px] bg-creme-50 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink md:rounded-md">
            <button type="button" onClick={() => setAjuda(false)} aria-label="Fechar" className="absolute right-3 top-3 rounded-pill p-2 text-muted"><X size={22} /></button>
            <p className="font-serif text-2xl font-bold">Instalar no iPhone</p>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-vinho-700 font-bold text-creme-50">1</span><span>No Safari, toque em <b>Compartilhar</b> <Share size={18} className="inline text-vinho-500" aria-hidden /> (embaixo da tela).</span></li>
              <li className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-vinho-700 font-bold text-creme-50">2</span><span>Role e toque em <b>Adicionar à Tela de Início</b> <SquarePlus size={18} className="inline text-vinho-500" aria-hidden />.</span></li>
              <li className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-vinho-700 font-bold text-creme-50">3</span><span>Toque em <b>Adicionar</b>. Pronto: o Aconchego fica na tela do celular, igual um app.</span></li>
            </ol>
            <p className="mt-4 text-sm text-muted">Está em outro navegador (Chrome, Instagram)? Abra o site no Safari primeiro.</p>
          </div>
        </div>
      )}
    </>
  );
}

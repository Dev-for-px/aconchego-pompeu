"use client";
import { useEffect } from "react";

// Se a pessoa tocar num atalho de categoria que está encolhida, abre a categoria antes de rolar até ela.
export function AbrirCategoria() {
  useEffect(() => {
    const abrir = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      const alvo = a ? document.getElementById(decodeURIComponent(a.hash.slice(1))) : null;
      const det = alvo?.querySelector("details");
      if (det && !det.open) det.open = true;
    };
    document.addEventListener("click", abrir, true);
    return () => document.removeEventListener("click", abrir, true);
  }, []);
  return null;
}

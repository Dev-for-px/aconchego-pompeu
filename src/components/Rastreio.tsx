"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { classificarLink, registrar, type TipoEvento } from "@/lib/rastreio";

/** Escuta os cliques do site inteiro e conta as visitas de cada página. */
export function Rastreio() {
  const caminho = usePathname();

  useEffect(() => {
    registrar("visita", document.title.split("|")[0].trim());
  }, [caminho]);

  useEffect(() => {
    const clique = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("a, button, [data-evento]") as HTMLElement | null;
      if (!el) return;
      const texto = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
      const marcado = el.closest("[data-evento]") as HTMLElement | null;
      if (marcado?.dataset.evento) {
        registrar(marcado.dataset.evento as TipoEvento, marcado.dataset.rotulo || texto);
        return;
      }
      const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") ?? "" : "";
      const tipo = href && classificarLink(el instanceof HTMLAnchorElement ? el.href : href, texto);
      if (tipo) registrar(tipo[0], tipo[1]);
    };
    document.addEventListener("click", clique, true);
    return () => document.removeEventListener("click", clique, true);
  }, []);

  return null;
}

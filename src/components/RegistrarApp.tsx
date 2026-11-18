"use client";
import { useEffect } from "react";

/** Liga o service worker (PWA) e guarda o convite de instalação do Android para o botão "Instalar app". */
export function RegistrarApp() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

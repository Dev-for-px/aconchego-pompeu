"use client";
import { useSyncExternalStore, type ReactNode } from "react";
import { almocoNoAr, type Horarios } from "@/lib/horario";

// Rechecagem a cada minuto: depois do horário configurado o cardápio do almoço sai do ar sozinho.
function inscrever(cb: () => void) {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
}

export function AlmocoNoAr({ horarios, children, encerrado }: { horarios: Horarios; children: ReactNode; encerrado: ReactNode }) {
  const noAr = useSyncExternalStore(inscrever, () => almocoNoAr(horarios), () => true);
  return <>{noAr ? children : encerrado}</>;
}

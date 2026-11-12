"use client";
import { useEffect, useState } from "react";
import { statusAgora, type Horarios } from "@/lib/horario";

export function StatusAberto({ horarios }: { horarios: Horarios }) {
  const [s, setS] = useState<ReturnType<typeof statusAgora> | null>(null);
  useEffect(() => {
    const atualizar = () => setS(statusAgora(horarios));
    atualizar();
    const t = setInterval(atualizar, 60_000);
    return () => clearInterval(t);
  }, [horarios]);
  if (!s) return <span className="inline-block h-8" aria-hidden />;
  return (
    <span className={`inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm font-semibold text-creme-50 ${s.aberto ? "bg-aberto" : "bg-fechado"}`}>
      <span className="h-2 w-2 rounded-full bg-creme-50" aria-hidden />
      {s.texto}
    </span>
  );
}

"use client";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { CupSoda, Moon, Sun } from "lucide-react";
import { statusAgora, type Horarios } from "@/lib/horario";

const semInscricao = () => () => {};

// Os dois conteúdos já vêm prontos no HTML (bom para SEO); as abas só escolhem qual mostrar.
type Aba = "almoco" | "noite" | "bebidas";

export function AbasTurno({ horarios, almoco, noite, bebidas }: { horarios: Horarios; almoco: ReactNode; noite: ReactNode; bebidas?: ReactNode }) {
  // Sem escolha do visitante, a aba segue o turno atual (no servidor, "almoco").
  const turnoAgora = useSyncExternalStore(semInscricao, () => statusAgora(horarios).turno, () => "almoco" as const);
  const [escolha, setAba] = useState<Aba | null>(null);
  const aba = escolha ?? turnoAgora;
  const botao = (id: Aba, texto: string, Icone: typeof Sun) => (
    <button
      type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)} data-evento="aba" data-rotulo={texto}
      className={`flex flex-1 items-center justify-center gap-2 rounded-pill whitespace-nowrap px-2 py-3 text-[15px] sm:px-3 sm:text-base font-semibold transition ${aba === id ? "bg-vinho-700 text-creme-50" : "text-ink"}`}
    >
      <Icone size={20} aria-hidden />{texto}
    </button>
  );
  return (
    <div>
      <div role="tablist" className="mx-auto flex max-w-md rounded-pill border border-linha bg-creme-200 p-1">
        {botao("almoco", "Almoço", Sun)}
        {botao("noite", "Pizzaria", Moon)}
        {bebidas && botao("bebidas", "Bebidas", CupSoda)}
      </div>
      <div className="mt-6" hidden={aba !== "almoco"}>{almoco}</div>
      <div className="mt-6" hidden={aba !== "noite"}>{noite}</div>
      {bebidas && <div className="mt-6" hidden={aba !== "bebidas"}>{bebidas}</div>}
    </div>
  );
}

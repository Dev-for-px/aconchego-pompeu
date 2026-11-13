"use client";
import Link from "next/link";
import { Logo } from "./Logo";
import { NEGOCIO } from "@/lib/site";

// Logo oficial no topo, em todas as páginas.
export function LogoTopo() {
  return (
    <Link href="/" aria-label={`${NEGOCIO.nome} – página inicial`} className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
      <Logo variante="branca" altura={50} prioridade />
    </Link>
  );
}

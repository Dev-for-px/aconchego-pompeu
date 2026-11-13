"use client";
import Link from "next/link";
import { Logo } from "./Logo";
import { NEGOCIO } from "@/lib/site";

// Logo oficial no topo, em todas as páginas.
export function LogoTopo() {
  return (
    <Link href="/" aria-label={`${NEGOCIO.nome} – página inicial`}>
      <Logo variante="branca" altura={50} prioridade />
    </Link>
  );
}

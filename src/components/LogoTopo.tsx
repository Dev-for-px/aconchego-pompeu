"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { NEGOCIO } from "@/lib/site";

// Na página inicial a logo aparece grande na capa; no topo ela só surge nas outras páginas.
export function LogoTopo() {
  const naHome = usePathname() === "/";
  return (
    <Link href="/" aria-label={`${NEGOCIO.nome} – página inicial`} className={naHome ? "invisible md:visible" : ""}>
      <Logo variante="branca" altura={44} prioridade={!naHome} />
    </Link>
  );
}

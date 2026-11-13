import Link from "next/link";
import { LogoTopo } from "./LogoTopo";
import { MenuMobile } from "./MenuMobile";
import type { Horarios } from "@/lib/horario";

export const LINKS = [
  { href: "/almoco-hoje", label: "Almoço de hoje" },
  { href: "/cardapio", label: "Cardápio da noite" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/perguntas-frequentes", label: "Dúvidas" },
  { href: "/novidades", label: "Novidades" },
  { href: "/contato", label: "Como chegar" },
];

export function Header({ horarios }: { horarios: Horarios }) {
  return (
    <header className="sticky top-0 z-40 bg-vinho-700 text-creme-50">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <LogoTopo />
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex gap-6 text-sm font-semibold">
            {LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="opacity-90 hover:underline hover:opacity-100">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        <MenuMobile links={LINKS} horarios={horarios} />
      </div>
    </header>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";
import { NEGOCIO } from "@/lib/site";

const links = [
  { href: "/almoco-hoje", label: "Almoço de hoje" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/sobre", label: "Sobre" },
  { href: "/perguntas-frequentes", label: "Dúvidas" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-vinho-700 text-creme-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label={`${NEGOCIO.nome} – página inicial`}>
          <Logo variante="branca" altura={44} />
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex gap-6 text-sm font-semibold">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} className="opacity-90 hover:opacity-100 hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <nav aria-label="Atalhos" className="border-t border-vinho-800 md:hidden">
        <ul className="flex gap-5 overflow-x-auto px-4 py-2 text-sm font-semibold">
          {links.map((l) => (
            <li key={l.href} className="shrink-0"><Link href={l.href}>{l.label}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

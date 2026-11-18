"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { useCarrinho } from "@/lib/carrinho";
import { linkExterno, menuAtivo, type ItemMenu } from "@/lib/menu";

/** Menu do topo no computador (no celular fica o MenuMobile). */
export function MenuTopo({ links }: { links: ItemMenu[] }) {
  const caminho = usePathname();
  const { config } = useCarrinho();
  return (
    <nav aria-label="Principal" className="hidden md:block">
      <ul className="flex gap-5 text-sm font-semibold lg:gap-6">
        {links.map((l) => {
          const ativo = menuAtivo(l.href, caminho);
          return (
            <li key={`${l.href}-${l.rotulo}`}>
              {linkExterno(l.href)
                ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap opacity-90 hover:underline hover:opacity-100">{l.rotulo}</a>
                : <Link href={l.href} aria-current={ativo ? "page" : undefined} className={`whitespace-nowrap hover:underline ${ativo ? "underline underline-offset-4 opacity-100" : "opacity-90 hover:opacity-100"}`}>{l.rotulo}</Link>}
            </li>
          );
        })}
        {config.clientesCadastro && (
          <li><Link href="/conta" aria-label="Minha conta" title="Minha conta" className="opacity-90 hover:opacity-100"><UserRound size={18} /></Link></li>
        )}
      </ul>
    </nav>
  );
}

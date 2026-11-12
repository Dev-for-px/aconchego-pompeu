"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ExternalLink, Home, LogOut, Settings, Sun, UtensilsCrossed, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NOME_PERFIL, SessaoProvider, useSessao, type Perfil } from "@/lib/admin/sessao";

const ABAS: { href: string; label: string; Icone: typeof Home; perfis: Perfil[] }[] = [
  { href: "/admin", label: "Início", Icone: Home, perfis: ["dono", "gerente", "social", "atendente"] },
  { href: "/admin/almoco", label: "Almoço", Icone: Sun, perfis: ["dono", "gerente", "social"] },
  { href: "/admin/cardapio", label: "Cardápio", Icone: UtensilsCrossed, perfis: ["dono", "gerente", "atendente"] },
  { href: "/admin/equipe", label: "Equipe", Icone: Users, perfis: ["dono"] },
  { href: "/admin/ajustes", label: "Ajustes", Icone: Settings, perfis: ["dono", "gerente"] },
];

function Conteudo({ children }: { children: ReactNode }) {
  const { membro, carregando, sair } = useSessao();
  const caminho = usePathname();
  const naEntrada = caminho === "/admin/entrar";

  useEffect(() => {
    if (!carregando && !membro && !naEntrada) window.location.replace("/admin/entrar");
  }, [carregando, membro, naEntrada]);

  if (naEntrada) return <>{children}</>;
  if (carregando || !membro) return <p className="p-10 text-center text-muted">Carregando…</p>;

  const abas = ABAS.filter((a) => a.perfis.includes(membro.perfil));
  const ativa = (href: string) => (href === "/admin" ? caminho === "/admin" : caminho.startsWith(href));
  return (
    <div className="min-h-dvh pb-24 md:pb-8">
      <header className="bg-vinho-700 text-creme-50">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" aria-label="Painel – início"><Logo variante="branca" altura={36} /></Link>
          <div className="flex items-center gap-1 text-right text-sm">
            <span className="mr-2 leading-tight"><b className="block">{membro.nome.split(" ")[0]}</b><span className="opacity-80">{NOME_PERFIL[membro.perfil]}</span></span>
            <a href="/" target="_blank" aria-label="Ver o site" className="rounded-pill p-2 hover:bg-vinho-800"><ExternalLink size={20} /></a>
            <button type="button" onClick={sair} aria-label="Sair" className="rounded-pill p-2 hover:bg-vinho-800"><LogOut size={20} /></button>
          </div>
        </div>
        <nav aria-label="Painel" className="mx-auto hidden max-w-3xl gap-1 px-4 pb-2 md:flex">
          {abas.map((a) => (
            <Link key={a.href} href={a.href} className={`rounded-pill px-4 py-2 text-sm font-semibold ${ativa(a.href) ? "bg-creme-50 text-vinho-700" : "hover:bg-vinho-800"}`}>{a.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      <nav aria-label="Painel" className="fixed inset-x-0 bottom-0 z-50 flex border-t border-linha bg-creme-50 pb-[env(safe-area-inset-bottom)] md:hidden">
        {abas.map(({ href, label, Icone }) => (
          <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold ${ativa(href) ? "text-vinho-700" : "text-muted"}`}>
            <Icone size={22} aria-hidden />{label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return <SessaoProvider><Conteudo>{children}</Conteudo></SessaoProvider>;
}

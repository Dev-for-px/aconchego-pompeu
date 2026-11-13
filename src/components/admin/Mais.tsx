"use client";
import Link from "next/link";
import { ChevronRight, ExternalLink, LogOut, Settings, Users } from "lucide-react";
import { useSessao } from "@/lib/admin/sessao";
import { Titulo } from "./ui";

export function Mais() {
  const { pode, sair } = useSessao();
  const item = "flex items-center gap-4 rounded-md border border-linha bg-creme-50 p-4";
  return (
    <>
      <Titulo>Mais opções</Titulo>
      <div className="space-y-3">
        {pode("dono", "gerente") && (
          <Link href="/admin/ajustes" className={item}>
            <Settings size={26} className="text-vinho-500" aria-hidden />
            <span className="flex-1"><b className="block">Ajustes do site</b><span className="text-sm text-muted">Horários, taxa de entrega, WhatsApp, redes sociais, perguntas frequentes e história</span></span>
            <ChevronRight className="text-muted" />
          </Link>
        )}
        {pode("dono") && (
          <Link href="/admin/equipe" className={item}>
            <Users size={26} className="text-vinho-500" aria-hidden />
            <span className="flex-1"><b className="block">Equipe e acessos</b><span className="text-sm text-muted">Cadastrar quem pode mexer no painel e trocar senhas</span></span>
            <ChevronRight className="text-muted" />
          </Link>
        )}
        <a href="/" target="_blank" rel="noopener noreferrer" className={item}>
          <ExternalLink size={26} className="text-vinho-500" aria-hidden />
          <span className="flex-1"><b className="block">Ver o site</b><span className="text-sm text-muted">Abre o site em outra aba, do jeito que o cliente vê</span></span>
        </a>
        <button type="button" onClick={sair} className={`${item} w-full text-left`}>
          <LogOut size={26} className="text-fechado" aria-hidden />
          <span className="flex-1"><b className="block">Sair do painel</b><span className="text-sm text-muted">Use em celular que não é seu</span></span>
        </button>
      </div>
    </>
  );
}

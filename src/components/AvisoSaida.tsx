"use client";
import { useEffect, useState } from "react";
import { MessageCircle, Phone, UtensilsCrossed, X } from "lucide-react";
import type { Saida } from "@/lib/saida";
import { NEGOCIO, linkWhatsApp } from "@/lib/site";

const CHAVE = "aconchego:aviso-saida";

/**
 * Aviso "Já vai?" mostrado uma vez por visita quando a pessoa demonstra que vai sair:
 * no computador, quando o mouse vai para fora da página; no celular, quando rola rápido para o topo
 * depois de já ter navegado um pouco. Não mexe no botão Voltar do navegador (o Google pune isso).
 */
export function AvisoSaida({ config, whatsapp }: { config: Saida; whatsapp: string }) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!config.ativo) return;
    let jaMostrou = false;
    try { jaMostrou = sessionStorage.getItem(CHAVE) === "1"; } catch {}
    if (jaMostrou) return;
    const inicio = Date.now();
    let ultimoY = window.scrollY, ultimoT = Date.now(), maxY = 0;

    const mostrar = () => {
      if (Date.now() - inicio < 8000) return; // não incomoda quem acabou de chegar
      try { sessionStorage.setItem(CHAVE, "1"); } catch {}
      setAberto(true);
      limpar();
    };
    const mouse = (e: MouseEvent) => { if (e.clientY <= 0) mostrar(); };
    const rolar = () => {
      const y = window.scrollY, t = Date.now();
      maxY = Math.max(maxY, y);
      const velocidade = (ultimoY - y) / Math.max(1, t - ultimoT); // px/ms subindo
      if (maxY > 800 && y < 300 && velocidade > 2.5) mostrar();
      ultimoY = y; ultimoT = t;
    };
    const limpar = () => {
      document.removeEventListener("mouseout", mouse);
      window.removeEventListener("scroll", rolar);
    };
    document.addEventListener("mouseout", mouse);
    window.addEventListener("scroll", rolar, { passive: true });
    return limpar;
  }, [config.ativo]);

  if (!aberto) return null;
  const botao =
    config.botao === "ligar" ? { href: `tel:+${NEGOCIO.telefone}`, Icone: Phone, fora: false }
    : config.botao === "cardapio" ? { href: "/cardapio", Icone: UtensilsCrossed, fora: false }
    : { href: linkWhatsApp("Olá! Vim pelo site do Aconchego e quero fazer um pedido.", whatsapp), Icone: MessageCircle, fora: true };
  return (
    <div role="dialog" aria-modal="true" aria-label={config.titulo} className="fixed inset-0 z-[85] flex items-end justify-center md:items-center">
      <button type="button" aria-label="Fechar" onClick={() => setAberto(false)} className="absolute inset-0 bg-ink/50" />
      <div className="relative w-full max-w-md rounded-t-[20px] bg-creme-50 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center md:rounded-md">
        <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="absolute right-3 top-3 rounded-pill p-2 text-muted"><X size={22} /></button>
        <p className="font-serif text-2xl font-bold text-ink">{config.titulo}</p>
        <p className="mt-2 text-muted">{config.texto}</p>
        <a href={botao.href} {...(botao.fora ? { target: "_blank", rel: "noopener noreferrer" } : {})} onClick={() => setAberto(false)}
          className={`mt-5 flex items-center justify-center gap-2 rounded-pill px-5 py-3.5 text-base font-semibold text-creme-50 ${config.botao === "whatsapp" ? "bg-aberto" : "bg-vinho-700"}`}>
          <botao.Icone size={22} aria-hidden />{config.textoBotao}
        </a>
        <button type="button" onClick={() => setAberto(false)} className="mt-3 text-sm text-muted underline">Agora não</button>
      </div>
    </div>
  );
}

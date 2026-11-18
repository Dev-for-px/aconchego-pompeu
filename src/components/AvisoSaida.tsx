"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, UtensilsCrossed, X } from "lucide-react";
import { CHAVE_AVISO_SAIDA, type Saida } from "@/lib/saida";
import { NEGOCIO, linkWhatsApp } from "@/lib/site";
import { registrar } from "@/lib/rastreio";

const MARCA = "aconchegoSaida"; // marca na entrada extra do histórico
const ESPERA_MS = 4000;          // não incomoda quem acabou de chegar

const jaMostrou = () => { try { return sessionStorage.getItem(CHAVE_AVISO_SAIDA) === "1"; } catch { return false; } };
const temMarca = (s: unknown) => !!s && typeof s === "object" && (s as Record<string, unknown>)[MARCA] === true;

/**
 * Aviso "Já vai?" — aparece UMA vez por visita quando a pessoa mostra que vai sair:
 * 1. Botão Voltar (celular e computador): depois que a pessoa interage com a página, o site guarda
 *    uma entrada extra no histórico. O 1º Voltar mostra o aviso; o 2º Voltar sai normalmente
 *    (nunca prende a pessoa: é uma vez só e o caminho de saída continua livre).
 * 2. Computador: mouse saindo pela parte de cima da janela (indo para abas, endereço ou fechar).
 * 3. Celular: rolagem rápida de volta ao topo depois de ter descido a página.
 * Não aparece no carrinho (/pedido) nem para quem já mandou o pedido.
 */
export function AvisoSaida({ config, whatsapp }: { config: Saida; whatsapp: string }) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();
  const noCarrinho = caminho === "/pedido";

  useEffect(() => {
    if (!config.ativo || noCarrinho || jaMostrou()) return;
    const inicio = Date.now();
    let armadoEm: string | null = null;
    let ultimoY = window.scrollY, ultimoT = Date.now(), maxY = window.scrollY;

    const mostrar = (motivo: string) => {
      if (jaMostrou()) return limpar();
      try { sessionStorage.setItem(CHAVE_AVISO_SAIDA, "1"); } catch {}
      limpar();
      // Mostrou por outro motivo: tira a entrada extra para o Voltar seguinte sair direto.
      if (motivo !== "voltar" && armadoEm === location.href && temMarca(history.state)) history.back();
      setAberto(true);
      registrar("aviso_saida", motivo);
    };

    // 1) Botão Voltar
    const armar = () => {
      if (armadoEm || Date.now() - inicio < 1500) return;
      armadoEm = location.href;
      history.pushState({ ...(history.state ?? {}), [MARCA]: true }, "", location.href);
      tirarArmar();
    };
    const voltar = (e: PopStateEvent) => {
      // Voltou da entrada extra para a original, na mesma página = quer sair do site.
      if (armadoEm && location.href === armadoEm && !temMarca(e.state)) mostrar("voltar");
    };

    // 2) Mouse saindo pelo topo (computador)
    const mouse = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 15) return;
      if (Date.now() - inicio >= ESPERA_MS) mostrar("mouse");
    };

    // 3) Rolagem rápida para o topo (celular)
    const rolar = () => {
      const y = window.scrollY, t = Date.now();
      maxY = Math.max(maxY, y);
      const velocidade = (ultimoY - y) / Math.max(1, t - ultimoT); // px/ms subindo
      if (Date.now() - inicio >= ESPERA_MS && maxY > 600 && y < 200 && velocidade > 1.5) mostrar("rolagem");
      ultimoY = y; ultimoT = t;
    };

    const gatilhos = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const tirarArmar = () => gatilhos.forEach((g) => window.removeEventListener(g, armar));
    const limpar = () => {
      tirarArmar();
      window.removeEventListener("popstate", voltar);
      document.documentElement.removeEventListener("mouseout", mouse);
      window.removeEventListener("scroll", rolar);
    };
    // O navegador só respeita a entrada extra depois de um gesto da pessoa (toque, tecla, rolagem).
    gatilhos.forEach((g) => window.addEventListener(g, armar, { passive: true }));
    window.addEventListener("popstate", voltar);
    document.documentElement.addEventListener("mouseout", mouse);
    window.addEventListener("scroll", rolar, { passive: true });
    return limpar;
  }, [config.ativo, noCarrinho]);

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aberto]);

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
          data-evento="aviso_saida_botao" data-rotulo={config.botao}
          className={`mt-5 flex items-center justify-center gap-2 rounded-pill px-5 py-3.5 text-base font-semibold text-creme-50 ${config.botao === "whatsapp" ? "bg-aberto" : "bg-vinho-700"}`}>
          <botao.Icone size={22} aria-hidden />{config.textoBotao}
        </a>
        <button type="button" onClick={() => setAberto(false)} className="mt-3 text-sm text-muted underline">Agora não</button>
      </div>
    </div>
  );
}

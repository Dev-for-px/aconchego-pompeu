"use client";
// Registro anônimo de cliques e visitas para o painel de Resultados.
// Não guarda nome, telefone nem nada que identifique a pessoa: só o tipo do clique,
// um detalhe (ex.: nome do prato), a página e um código aleatório da visita.
import { createClient } from "./supabase/client";
import { supabaseConfigured } from "./supabase/env";

export type TipoEvento =
  | "visita" | "whatsapp" | "ligar" | "como_chegar" | "rede" | "link_externo"
  | "add_carrinho" | "ver_pedido" | "enviar_pedido" | "busca" | "aba" | "clique";

function sessao() {
  try {
    let s = sessionStorage.getItem("aconchego:sessao");
    if (!s) { s = Math.random().toString(36).slice(2, 12); sessionStorage.setItem("aconchego:sessao", s); }
    return s;
  } catch { return null; }
}

export function registrar(tipo: TipoEvento, rotulo?: string | null) {
  if (!supabaseConfigured || typeof window === "undefined") return;
  if (/^\/admin/.test(location.pathname)) return;
  const linha = { tipo, rotulo: rotulo?.slice(0, 120) ?? null, pagina: location.pathname.slice(0, 200), sessao: sessao() };
  createClient().from("eventos").insert(linha).then(() => {}, () => {});
}

const REDES: [RegExp, string][] = [
  [/instagram\.com/, "Instagram"], [/facebook\.com|fb\.com/, "Facebook"], [/tiktok\.com/, "TikTok"],
  [/youtube\.com|youtu\.be/, "YouTube"], [/aiqfome/, "Aiqfome"], [/ifood/, "iFood"],
  [/tripadvisor/, "Tripadvisor"], [/linktr\.ee/, "Linktree"], [/g\.page|business\.google|share\.google/, "Google"],
];

/** Descobre o que foi clicado a partir do link. */
export function classificarLink(href: string, texto: string): [TipoEvento, string] | null {
  if (/^https:\/\/wa\.me|api\.whatsapp\.com/.test(href)) return ["whatsapp", texto];
  if (href.startsWith("tel:")) return ["ligar", texto];
  if (/google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl/.test(href)) return ["como_chegar", texto];
  for (const [re, nome] of REDES) if (re.test(href)) return ["rede", nome];
  if (/^https?:\/\//.test(href) && !href.includes(location.host)) return ["link_externo", new URL(href).hostname];
  return null;
}

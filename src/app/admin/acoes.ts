"use server";
import { updateTag } from "next/cache";

const PERMITIDAS = new Set(["config", "cardapio", "almoco", "faq", "avaliacoes", "galeria", "promocoes", "posts"]);

/** Chamado pelo painel depois de salvar: o site mostra a mudança na hora. */
export async function atualizarSite(tags: string[]) {
  for (const t of tags) if (PERMITIDAS.has(t)) updateTag(t);
}

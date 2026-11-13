// Leitura pública dos dados do Supabase, com cache do Next.js.
// O painel (etapa 5) chama revalidateTag/updateTag com estas tags ao salvar.
import { createClient as createSupabase } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { supabaseConfigured, supabaseKey, supabaseUrl } from "./supabase/env";
import { HORARIOS_PADRAO, hojeEmPompeu, type Horarios } from "./horario";
import type { Redes } from "./redes";
import { SAIDA_PADRAO, type Saida } from "./saida";
export { SAIDA_PADRAO, type Saida };

export type Categoria = { id: string; nome: string; slug: string; descricao: string | null; turno: "almoco" | "noite" | "ambos"; ordem: number };
export type Adicional = { id: string; nome: string; preco: number | null; preco_por_variacao?: Record<string, number> | null };
export type Variacao = { nome: string; preco: number | null };
export type Produto = {
  id: string; categoria_id: string; nome: string; slug: string; descricao: string | null;
  preco: number | null; variacoes: Variacao[]; foto_url: string | null; foto_alt: string | null; tags: string[];
  disponivel: boolean; destaque: boolean; meio_a_meio: boolean; ordem: number; atualizado_em: string;
  adicionais?: Adicional[];
};
export type Faq = { id: string; pergunta: string; resposta: string };
export type Avaliacao = { id: string; autor: string; nota: number; texto: string | null; data: string | null };
export type Foto = { id: string; url: string; legenda: string | null; turno?: "almoco" | "noite" | "ambos" };
export type Promocao = { id: string; titulo: string; descricao: string | null; preco: number | null; foto_url: string | null; valido_de: string | null; valido_ate: string | null };
export type SecaoAlmoco = { secao: string; itens: { nome: string; preco?: number | null }[] };
export type Almoco = { data: string; itens: SecaoAlmoco[]; atualizado_em: string } | null;
export type Post = { id: string; titulo: string; slug: string; resumo: string | null; conteudo: string; capa_url: string | null; publicado_em: string | null; atualizado_em: string };
export type Config = {
  mostrar_precos: boolean; pedidos_pausados: boolean; whatsapp: string; telefone: string;
  taxa_entrega: number | null; pedido_minimo: number | null; horarios: Horarios;
  redes: Redes;
  saida: Saida;
  formas_pagamento: string[]; historia: string | null;
};

const CONFIG_PADRAO: Config = {
  mostrar_precos: false, pedidos_pausados: false, whatsapp: "5537999943111", telefone: "553735233111",
  taxa_entrega: 4, pedido_minimo: null, horarios: HORARIOS_PADRAO, redes: {},
  formas_pagamento: ["Dinheiro", "Pix", "Cartão de débito", "Cartão de crédito", "Vale-refeição"], historia: null,
  saida: SAIDA_PADRAO,
};

function db() {
  return createSupabase(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

async function seguro<T>(fn: () => Promise<T>, padrao: T): Promise<T> {
  if (!supabaseConfigured) return padrao;
  try {
    return await fn();
  } catch (e) {
    console.error("[dados]", e);
    return padrao;
  }
}

export async function getConfig(): Promise<Config> {
  "use cache";
  cacheLife("minutes");
  cacheTag("config");
  return seguro(async () => {
    const { data, error } = await db().from("configuracoes").select("*").eq("id", 1).single();
    if (error) throw error;
    const horarios = data.horarios?.almoco ? data.horarios : HORARIOS_PADRAO;
    return { ...CONFIG_PADRAO, ...data, horarios, redes: data.redes ?? {}, saida: { ...SAIDA_PADRAO, ...(data.saida ?? {}) } };
  }, CONFIG_PADRAO);
}

export async function getCategorias(): Promise<Categoria[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cardapio");
  return seguro(async () => {
    const { data, error } = await db().from("categorias").select("id,nome,slug,descricao,turno,ordem").eq("ativo", true).order("ordem");
    if (error) throw error;
    return data as Categoria[];
  }, []);
}

export async function getProdutos(): Promise<Produto[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cardapio");
  return seguro(async () => {
    const { data, error } = await db()
      .from("produtos")
      .select("*, adicionais(id,nome,preco,preco_por_variacao,ordem)")
      .order("ordem");
    if (error) throw error;
    return (data as Produto[]).map((p) => ({ ...p, variacoes: p.variacoes ?? [], adicionais: [...(p.adicionais ?? [])].sort((a, b) => ((a as { ordem?: number }).ordem ?? 0) - ((b as { ordem?: number }).ordem ?? 0)) }));
  }, []);
}

/** Menor preço do produto (considerando tamanhos). */
export function precoMinimo(p: Pick<Produto, "preco" | "variacoes">) {
  const v = p.variacoes.map((x) => x.preco).filter((x): x is number => x != null);
  if (v.length) return Math.min(...v);
  return p.preco;
}

export async function getFaq(): Promise<Faq[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("faq");
  return seguro(async () => {
    const { data, error } = await db().from("faq").select("id,pergunta,resposta").eq("ativo", true).order("ordem");
    if (error) throw error;
    return data as Faq[];
  }, []);
}

export async function getAvaliacoes(): Promise<Avaliacao[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("avaliacoes");
  return seguro(async () => {
    const { data, error } = await db().from("avaliacoes").select("id,autor,nota,texto,data").eq("ativo", true).order("data", { ascending: false }).limit(12);
    if (error) throw error;
    return data as Avaliacao[];
  }, []);
}

export async function getGaleria(): Promise<Foto[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("galeria");
  return seguro(async () => {
    const { data, error } = await db().from("galeria").select("id,url,legenda,turno").eq("ativo", true).order("ordem");
    if (error) throw error;
    return data as Foto[];
  }, []);
}

export async function getPromocoesAtivas(): Promise<Promocao[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("promocoes");
  const hoje = hojeEmPompeu();
  return seguro(async () => {
    const { data, error } = await db().from("promocoes").select("id,titulo,descricao,preco,foto_url,valido_de,valido_ate").eq("ativo", true);
    if (error) throw error;
    return (data as Promocao[]).filter((p) => (!p.valido_de || p.valido_de <= hoje) && (!p.valido_ate || p.valido_ate >= hoje));
  }, []);
}

/** Cardápio do almoço publicado para HOJE (fuso de Pompéu). Nunca devolve o de outro dia. */
export async function getAlmocoHoje(): Promise<Almoco> {
  "use cache";
  cacheLife("minutes");
  cacheTag("almoco");
  const hoje = hojeEmPompeu();
  return seguro(async () => {
    const { data, error } = await db().from("cardapio_almoco").select("data,itens,atualizado_em").eq("data", hoje).eq("publicado", true).maybeSingle();
    if (error) throw error;
    return (data as Almoco) ?? null;
  }, null);
}

/** Categorias com seus produtos, já filtradas por turno. */
export async function getCardapio(turno?: "almoco" | "noite") {
  const [categorias, produtos] = await Promise.all([getCategorias(), getProdutos()]);
  return categorias
    .filter((c) => !turno || c.turno === turno || c.turno === "ambos")
    .map((c) => ({ ...c, produtos: produtos.filter((p) => p.categoria_id === c.id) }));
}

export async function getPosts(limite = 50): Promise<Post[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  return seguro(async () => {
    const { data, error } = await db().from("posts").select("id,titulo,slug,resumo,conteudo,capa_url,publicado_em,atualizado_em").eq("publicado", true).order("publicado_em", { ascending: false }).limit(limite);
    if (error) throw error;
    return data as Post[];
  }, []);
}

/** Tipos de marmitex cadastrados no painel (Almoço › Tipos de marmitex). */
export async function getMarmitas() {
  const cats = await getCardapio("almoco");
  return (cats.find((c) => c.slug === "marmitex")?.produtos ?? [])
    .filter((p) => p.disponivel)
    .map((p) => ({ id: p.id, nome: p.nome, descricao: p.descricao, preco: p.preco }));
}

import { PAGINAS_LOCAIS } from "@/lib/paginasLocais";
import type { MetadataRoute } from "next";
import { getCategorias, getPosts } from "@/lib/dados";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, posts] = await Promise.all([getCategorias(), getPosts(500)]);
  const fixas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/almoco-hoje`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/cardapio`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/perguntas-frequentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contato`, changeFrequency: "monthly", priority: 0.7 },
    ...PAGINAS_LOCAIS.map((p) => ({ url: `${SITE_URL}${p.url}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${SITE_URL}/novidades`, changeFrequency: "weekly", priority: 0.6 },
  ];
  const artigos = posts.map((p) => ({ url: `${SITE_URL}/novidades/${p.slug}`, lastModified: p.atualizado_em, changeFrequency: "monthly" as const, priority: 0.5 }));
  return [...fixas, ...artigos, ...categorias.map((c) => ({ url: `${SITE_URL}/cardapio/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }))];
}

import type { MetadataRoute } from "next";
import { getCategorias } from "@/lib/dados";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categorias = await getCategorias();
  const fixas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/almoco-hoje`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/cardapio`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/perguntas-frequentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contato`, changeFrequency: "monthly", priority: 0.7 },
  ];
  return [...fixas, ...categorias.map((c) => ({ url: `${SITE_URL}/cardapio/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }))];
}

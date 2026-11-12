import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoWhatsApp } from "@/components/Botoes";
import { dataPost } from "@/components/CardPost";
import { JsonLd } from "@/components/JsonLd";
import { TextoPost } from "@/components/TextoPost";
import { getPosts } from "@/lib/dados";
import { artigoJsonLd, breadcrumbJsonLd } from "@/lib/schema";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "em-breve" }];
}

async function buscar(slug: string) {
  return (await getPosts(500)).find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/novidades/[slug]">): Promise<Metadata> {
  const p = await buscar((await params).slug);
  if (!p) return { title: "Novidade não encontrada", robots: { index: false } };
  return {
    title: p.titulo,
    description: p.resumo ?? p.conteudo.slice(0, 155),
    alternates: { canonical: `/novidades/${p.slug}` },
    openGraph: { type: "article", title: p.titulo, description: p.resumo ?? undefined, images: p.capa_url ? [p.capa_url] : undefined, publishedTime: p.publicado_em ?? undefined },
  };
}

export default async function Publicacao({ params }: PageProps<"/novidades/[slug]">) {
  const p = await buscar((await params).slug);
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={artigoJsonLd(p)} />
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Novidades", url: "/novidades" }, { nome: p.titulo, url: `/novidades/${p.slug}` }])} />
      <nav aria-label="Você está em" className="text-sm text-muted"><Link href="/novidades" className="underline">Novidades</Link></nav>
      <h1 className="mt-2 text-4xl font-bold leading-tight">{p.titulo}</h1>
      <time dateTime={p.publicado_em ?? undefined} className="mt-2 block text-sm font-semibold text-vinho-500">{dataPost(p.publicado_em)}</time>
      {p.capa_url && <Image src={p.capa_url} alt={p.titulo} width={1200} height={675} sizes="(max-width: 768px) 100vw, 768px" priority className="mt-6 aspect-video w-full rounded-md object-cover" />}
      {p.resumo && <p className="mt-6 text-xl text-muted">{p.resumo}</p>}
      <div className="mt-6"><TextoPost texto={p.conteudo} /></div>
      <div className="mt-10"><BotaoWhatsApp texto="Pedir no WhatsApp" /></div>
    </article>
  );
}

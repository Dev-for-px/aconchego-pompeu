import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/dados";

export const dataPost = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }) : "");

export function CardPost({ p, nivel = 3 }: { p: Post; nivel?: 2 | 3 }) {
  const H = nivel === 2 ? "h2" : "h3";
  return (
    <article className="overflow-hidden rounded-md border border-linha bg-creme-50">
      <Link href={`/novidades/${p.slug}`} className="block">
        {p.capa_url ? (
          <Image src={p.capa_url} alt={p.titulo} width={640} height={360} sizes="(max-width: 768px) 100vw, 33vw" className="aspect-video w-full object-cover" />
        ) : (
          <div aria-hidden className="flex aspect-video items-center justify-center bg-vinho-700 p-6 text-center font-script text-3xl text-creme-50">Aconchego</div>
        )}
        <div className="p-4">
          <time dateTime={p.publicado_em ?? undefined} className="text-xs font-semibold uppercase tracking-wide text-vinho-500">{dataPost(p.publicado_em)}</time>
          <H className="mt-1 text-xl font-semibold text-ink">{p.titulo}</H>
          {p.resumo && <p className="mt-1 line-clamp-3 text-muted">{p.resumo}</p>}
        </div>
      </Link>
    </article>
  );
}

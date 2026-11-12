import type { Metadata } from "next";
import { CardPost } from "@/components/CardPost";
import { JsonLd } from "@/components/JsonLd";
import { getPosts } from "@/lib/dados";
import { breadcrumbJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Novidades – promoções, eventos e notícias",
  description: "Novidades do Restaurante e Pizzaria Aconchego em Pompéu – MG: promoções, eventos, pratos novos e avisos de funcionamento.",
  alternates: { canonical: "/novidades" },
};

export default async function Novidades() {
  const posts = await getPosts();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Novidades", url: "/novidades" }])} />
      <h1 className="text-4xl font-bold">Novidades do Aconchego</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Promoções, eventos, pratos novos e avisos do Restaurante e Pizzaria Aconchego, em Pompéu – MG.</p>
      {posts.length === 0 ? (
        <p className="mt-8 rounded-md bg-creme-200 p-6 text-center text-muted">Em breve as primeiras novidades por aqui.</p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">{posts.map((p) => <CardPost key={p.id} p={p} nivel={2} />)}</div>
      )}
    </div>
  );
}

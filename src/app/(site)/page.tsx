import Link from "next/link";
import { Suspense } from "react";
import { AbasTurno } from "@/components/AbasTurno";
import { AlmocoDoDia } from "@/components/AlmocoDoDia";
import { BotaoWhatsApp } from "@/components/Botoes";
import { CardProduto } from "@/components/CardProduto";
import { InfoCasa } from "@/components/InfoCasa";
import { JsonLd } from "@/components/JsonLd";
import { CardapioComBebidas } from "@/components/CardapioComBebidas";
import { ListaFaq } from "@/components/ListaFaq";
import { StatusAberto } from "@/components/StatusAberto";
import { getAlmocoHoje, getAvaliacoes, getCardapio, getConfig, getFaq, getGaleria, getPosts, getProdutos, getPromocoesAtivas } from "@/lib/dados";
import { GaleriaFaixa } from "@/components/GaleriaFaixa";
import Image from "next/image";
import { Busca } from "@/components/Busca";
import { Logo } from "@/components/Logo";
import { montarBusca } from "@/lib/busca";
import { CardPost } from "@/components/CardPost";
import { faqJsonLd } from "@/lib/schema";
import { NEGOCIO, formatarPreco } from "@/lib/site";

export default async function Home() {
  const [config, noite, dia, almoco, faq, produtos, promocoes, avaliacoes, fotos, posts] = await Promise.all([
    getConfig(), getCardapio("noite"), getCardapio("almoco"), getAlmocoHoje(), getFaq(), getProdutos(), getPromocoesAtivas(), getAvaliacoes(), getGaleria(), getPosts(3),
  ]);
  // Destaques são da noite (pizzaria/bar); no almoço aparecem o cardápio do dia e as bebidas.
  const idsNoite = new Set(noite.filter((c) => c.turno === "noite").map((c) => c.id));
  const busca = montarBusca([...dia, ...noite]);
  const destaques = produtos.filter((p) => p.destaque && p.disponivel && idsNoite.has(p.categoria_id)).slice(0, 4);

  return (
    <>
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}

      {/* Capa: logo em destaque, status, busca e os dois botões que vendem */}
      <section className="relative overflow-hidden bg-vinho-700 text-creme-50">
        {fotos[0] && (
          <Image src={fotos[0].url} alt="" fill priority sizes="100vw" className="object-cover opacity-[0.12] blur-[2px]" />
        )}
        <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 pb-6 pt-6 text-center md:pb-12 md:pt-10">
          <Logo variante="branca" altura={110} prioridade />
          <div className="mt-3"><Suspense><StatusAberto horarios={config.horarios} /></Suspense></div>
          <div className="mt-4 w-full"><Busca itens={busca} mostrarPreco={config.mostrar_precos} clara /></div>
          <div className="mt-3 grid w-full grid-cols-2 gap-2">
            <a href="#cardapio" className="rounded-pill bg-creme-50 px-4 py-3 text-center text-[15px] font-semibold text-vinho-700 hover:bg-creme-200 md:text-base">Ver cardápio</a>
            <BotaoWhatsApp texto="Pedir agora" compacto />
          </div>
          <h1 className="mt-4 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80 md:text-sm">Restaurante e pizzaria no centro de Pompéu – MG</h1>
        </div>
      </section>

      {/* Fotos logo depois da capa: o cliente come com os olhos */}
      {fotos.length > 0 && (
        <section aria-label="Fotos do Aconchego" className="bg-vinho-700 pb-5">
          <GaleriaFaixa fotos={fotos} />
        </section>
      )}

      {/* Cardápio por turno */}
      <section id="cardapio" aria-labelledby="t-cardapio" className="mx-auto max-w-5xl scroll-mt-16 px-4 py-6 md:py-12">
        <h2 id="t-cardapio" className="sr-only">Cardápio de hoje</h2>
        <Suspense>
          <AbasTurno
            horarios={config.horarios}
            almoco={
              <div className="space-y-10">
                <AlmocoDoDia almoco={almoco} mostrarPreco={config.mostrar_precos} nivel={3} horarios={config.horarios} />
                <CardapioComBebidas secoes={dia} mostrarPreco={config.mostrar_precos} nivel={3} prefixo="dia-" />
              </div>
            }
            noite={
              <div className="space-y-10">
                {(promocoes.length > 0 || destaques.length > 0) && (
                  <div>
                    <h3 className="mb-4 text-2xl font-semibold">Destaques da casa</h3>
                    {promocoes.length > 0 && (
                      <ul className="mb-4 grid gap-4 md:grid-cols-2">
                        {promocoes.map((p) => (
                          <li key={p.id} className="rounded-md border border-linha bg-creme-200 p-4">
                            <span className="rounded-sm bg-dourado px-2 py-0.5 text-xs font-semibold text-ink">Promoção</span>
                            <p className="mt-2 font-serif text-xl font-semibold">{p.titulo}</p>
                            {p.descricao && <p className="mt-1 text-muted">{p.descricao}</p>}
                            {config.mostrar_precos && p.preco != null && <p className="mt-2 text-lg font-bold text-vinho-500">{formatarPreco(p.preco)}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      {destaques.map((p) => <CardProduto key={p.id} p={p} mostrarPreco={config.mostrar_precos} grupo="Destaques" />)}
                    </div>
                  </div>
                )}
                <CardapioComBebidas secoes={noite} mostrarPreco={config.mostrar_precos} nivel={3} />
              </div>
            }
          />
        </Suspense>
      </section>

      {/* Sobre resumido */}
      <section aria-labelledby="t-sobre" className="mx-auto max-w-5xl px-4 py-12">
        <h2 id="t-sobre" className="text-3xl font-semibold">De dia restaurante, à noite pizzaria e choperia</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <p className="text-lg text-muted">
            No almoço, o {NEGOCIO.nome} é restaurante, churrascaria e choperia: self-service de comida caseira, à la carte, marmitex e chopp gelado, todos os dias das 11h às 15h.
          </p>
          <p className="text-lg text-muted">
            À noite vira pizzaria e choperia, com clima de bar: pizzas, crepes, porção de picanha na chapa e chopp gelado, de terça a domingo, das 18h à meia-noite. Delivery próprio e pelo Aiqfome.
          </p>
        </div>
        <Link href="/sobre" className="mt-4 inline-block font-semibold text-vinho-500 underline">Conheça nossa história</Link>
      </section>

      {avaliacoes.length > 0 && (
        <section aria-labelledby="t-avaliacoes" className="bg-creme-200">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 id="t-avaliacoes" className="mb-6 text-3xl font-semibold">O que dizem no Google</h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {avaliacoes.slice(0, 6).map((a) => (
                <li key={a.id} className="rounded-md border border-linha bg-creme-50 p-4">
                  <p aria-label={`Nota ${a.nota} de 5`} className="text-dourado">{"★".repeat(a.nota)}</p>
                  {a.texto && <p className="mt-2 text-ink">“{a.texto}”</p>}
                  <p className="mt-2 text-sm font-semibold text-muted">{a.autor}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section aria-labelledby="t-novidades" className="mx-auto max-w-5xl px-4 py-12">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="t-novidades" className="text-3xl font-semibold">Novidades</h2>
            <Link href="/novidades" className="font-semibold text-vinho-500 underline">Ver todas</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">{posts.map((p) => <CardPost key={p.id} p={p} />)}</div>
        </section>
      )}

      <section aria-labelledby="t-info" className="mx-auto max-w-5xl px-4 py-12">
        <h2 id="t-info" className="mb-6 text-3xl font-semibold">Horário, pagamento e localização</h2>
        <InfoCasa formasPagamento={config.formas_pagamento} horarios={config.horarios} />
      </section>

      {faq.length > 0 && (
        <section aria-labelledby="t-faq" className="mx-auto max-w-3xl px-4 py-12">
          <h2 id="t-faq" className="mb-6 text-3xl font-semibold">Perguntas frequentes</h2>
          <ListaFaq faq={faq.slice(0, 6)} />
          <Link href="/perguntas-frequentes" className="mt-4 inline-block font-semibold text-vinho-500 underline">Ver todas as perguntas</Link>
        </section>
      )}
    </>
  );
}

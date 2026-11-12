import Link from "next/link";
import { Suspense } from "react";
import { AbasTurno } from "@/components/AbasTurno";
import { AlmocoDoDia } from "@/components/AlmocoDoDia";
import { BotaoWhatsApp } from "@/components/Botoes";
import { CardProduto } from "@/components/CardProduto";
import { InfoCasa } from "@/components/InfoCasa";
import { JsonLd } from "@/components/JsonLd";
import { ListaCardapio } from "@/components/ListaCardapio";
import { ListaFaq } from "@/components/ListaFaq";
import { StatusAberto } from "@/components/StatusAberto";
import { getAlmocoHoje, getAvaliacoes, getCardapio, getConfig, getFaq, getProdutos, getPromocoesAtivas } from "@/lib/dados";
import { faqJsonLd } from "@/lib/schema";
import { NEGOCIO, formatarPreco } from "@/lib/site";

export default async function Home() {
  const [config, noite, dia, almoco, faq, produtos, promocoes, avaliacoes] = await Promise.all([
    getConfig(), getCardapio("noite"), getCardapio("almoco"), getAlmocoHoje(), getFaq(), getProdutos(), getPromocoesAtivas(), getAvaliacoes(),
  ]);
  // Destaques são da noite (pizzaria/bar); no almoço aparecem o cardápio do dia e as bebidas.
  const idsNoite = new Set(noite.filter((c) => c.turno === "noite").map((c) => c.id));
  const destaques = produtos.filter((p) => p.destaque && p.disponivel && idsNoite.has(p.categoria_id)).slice(0, 4);
  const diaComItens = dia.filter((c) => c.produtos.length > 0);

  return (
    <>
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}

      {/* Hero compacto */}
      <section className="relative overflow-hidden bg-vinho-700 text-creme-50">
        <svg aria-hidden className="absolute -right-4 -top-2 h-40 w-40 opacity-20" viewBox="0 0 160 200" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
          <path d="M40 190 C16 160 64 130 40 100 C16 70 64 40 40 10" />
          <path d="M80 190 C56 160 104 130 80 100 C56 70 104 40 80 10" />
          <path d="M120 190 C96 160 144 130 120 100 C96 70 144 40 120 10" />
        </svg>
        <div className="relative mx-auto max-w-5xl px-4 pb-6 pt-5 md:py-12">
          <Suspense><StatusAberto horarios={config.horarios} /></Suspense>
          <h1 className="mt-3 max-w-xl text-[1.7rem] font-bold leading-tight md:text-5xl">Restaurante e Pizzaria Aconchego em Pompéu – MG</h1>
          <p className="mt-2 max-w-xl text-base opacity-90 md:text-lg">Almoço caseiro e churrasco de dia. Bar, pizza e chopp à noite.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 md:flex md:gap-3">
            <a href="#cardapio" className="rounded-pill bg-creme-50 px-4 py-3 text-center text-base font-semibold text-vinho-700 hover:bg-creme-200">Ver cardápio</a>
            <BotaoWhatsApp texto="WhatsApp" />
          </div>
        </div>
      </section>

      {/* Cardápio por turno */}
      <section id="cardapio" aria-labelledby="t-cardapio" className="mx-auto max-w-5xl scroll-mt-16 px-4 py-6 md:py-12">
        <h2 id="t-cardapio" className="sr-only">Cardápio de hoje</h2>
        <Suspense>
          <AbasTurno
            horarios={config.horarios}
            almoco={
              <div className="space-y-10">
                <AlmocoDoDia almoco={almoco} mostrarPreco={config.mostrar_precos} nivel={3} />
                {diaComItens.length > 0 && <ListaCardapio secoes={diaComItens} mostrarPreco={config.mostrar_precos} nivel={3} prefixo="dia-" />}
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
                <ListaCardapio secoes={noite} mostrarPreco={config.mostrar_precos} nivel={3} />
              </div>
            }
          />
        </Suspense>
      </section>

      {/* Sobre resumido */}
      <section aria-labelledby="t-sobre" className="mx-auto max-w-5xl px-4 py-12">
        <h2 id="t-sobre" className="text-3xl font-semibold">De dia restaurante, à noite bar e pizzaria</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <p className="text-lg text-muted">
            No almoço, o {NEGOCIO.nome} é restaurante, churrascaria e choperia: self-service de comida caseira, à la carte, marmitex e chopp gelado, todos os dias das 11h às 15h.
          </p>
          <p className="text-lg text-muted">
            À noite vira o Bar Aconchego: pizzaria e choperia com pizzas, crepes, porção de picanha na chapa e chopp gelado, de terça a domingo, das 18h à meia-noite. Delivery próprio e pelo Aiqfome.
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

      <section aria-labelledby="t-info" className="mx-auto max-w-5xl px-4 py-12">
        <h2 id="t-info" className="mb-6 text-3xl font-semibold">Horário, pagamento e localização</h2>
        <InfoCasa formasPagamento={config.formas_pagamento} />
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

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
  const [config, noite, almoco, faq, produtos, promocoes, avaliacoes] = await Promise.all([
    getConfig(), getCardapio("noite"), getAlmocoHoje(), getFaq(), getProdutos(), getPromocoesAtivas(), getAvaliacoes(),
  ]);
  const destaques = produtos.filter((p) => p.destaque && p.disponivel).slice(0, 4);

  return (
    <>
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}

      {/* Hero */}
      <section className="relative overflow-hidden bg-vinho-700 text-creme-50">
        <svg aria-hidden className="absolute -right-6 bottom-0 h-56 w-56 opacity-25" viewBox="0 0 160 200" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
          <path d="M40 190 C16 160 64 130 40 100 C16 70 64 40 40 10" />
          <path d="M80 190 C56 160 104 130 80 100 C56 70 104 40 80 10" />
          <path d="M120 190 C96 160 144 130 120 100 C96 70 144 40 120 10" />
        </svg>
        <div className="relative mx-auto max-w-5xl px-4 py-14 md:py-20">
          <Suspense><StatusAberto horarios={config.horarios} /></Suspense>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">Restaurante e Pizzaria Aconchego em Pompéu – MG</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">
            Almoço caseiro, churrasco e chopp gelado todos os dias. À noite, bar e pizzaria com porções na chapa. No centro de Pompéu desde {NEGOCIO.desde}.
          </p>
          <p className="mt-2 font-script text-3xl">Comida caseira, quentinha</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cardapio" className="rounded-pill bg-creme-50 px-6 py-3 text-base font-semibold text-vinho-700 hover:bg-creme-200">Ver cardápio</Link>
            <BotaoWhatsApp />
          </div>
        </div>
      </section>

      {/* Cardápio por turno */}
      <section aria-labelledby="t-cardapio" className="mx-auto max-w-5xl px-4 py-12">
        <h2 id="t-cardapio" className="mb-6 text-center text-3xl font-semibold">Cardápio de hoje</h2>
        <Suspense>
          <AbasTurno
            horarios={config.horarios}
            almoco={<AlmocoDoDia almoco={almoco} mostrarPreco={config.mostrar_precos} nivel={3} />}
            noite={<ListaCardapio secoes={noite} mostrarPreco={config.mostrar_precos} nivel={3} />}
          />
        </Suspense>
      </section>

      {(promocoes.length > 0 || destaques.length > 0) && (
        <section aria-labelledby="t-destaques" className="bg-creme-200">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 id="t-destaques" className="mb-6 text-3xl font-semibold">Destaques da casa</h2>
            {promocoes.length > 0 && (
              <ul className="mb-6 grid gap-4 md:grid-cols-2">
                {promocoes.map((p) => (
                  <li key={p.id} className="rounded-md border border-linha bg-creme-50 p-4">
                    <span className="rounded-sm bg-dourado px-2 py-0.5 text-xs font-semibold text-ink">Promoção</span>
                    <h3 className="mt-2 text-xl font-semibold">{p.titulo}</h3>
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
        </section>
      )}

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

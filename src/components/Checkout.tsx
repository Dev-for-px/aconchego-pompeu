"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { History, MessageCircle, Trash2, UserRound } from "lucide-react";
import { precoItem, useCarrinho } from "@/lib/carrinho";
import { montarMensagem, type DadosCliente } from "@/lib/mensagem";
import { formatarPreco, linkWhatsApp, NEGOCIO } from "@/lib/site";
import { registrar } from "@/lib/rastreio";
import { dispensarAvisoSaida } from "@/lib/saida";
import { useConta } from "@/lib/conta";
import { supabaseConfigured } from "@/lib/supabase/env";
import { Quantidade } from "./Quantidade";

const CHAVE_CLIENTE = "aconchego:cliente";
const VAZIO: DadosCliente = { nome: "", telefone: "", tipo: "entrega", endereco: "", referencia: "", pagamento: "Pix", troco: "", obs: "" };

export function Checkout({ formasPagamento }: { formasPagamento: string[] }) {
  const c = useCarrinho();
  const [dados, setDados] = useState<DadosCliente>(VAZIO);
  const [tentou, setTentou] = useState(false);
  const { conta, supabase } = useConta();

  useEffect(() => {
    // Lembra nome e endereço do cliente neste aparelho.
    try {
      const salvo = localStorage.getItem(CHAVE_CLIENTE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (salvo) setDados({ ...VAZIO, ...JSON.parse(salvo), obs: "" });
    } catch {}
  }, []);
  useEffect(() => {
    // Cliente com conta: preenche com os dados salvos na conta (sem apagar o que já foi digitado).
    if (!conta) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDados((d) => ({
      ...d,
      nome: d.nome || conta.nome,
      telefone: d.telefone || (conta.telefone ? conta.telefone.replace(/^55/, "") : ""),
      endereco: d.endereco || conta.endereco || "",
      referencia: d.referencia || conta.referencia || "",
    }));
  }, [conta]);

  const set = <K extends keyof DadosCliente>(k: K, v: DadosCliente[K]) => setDados((d) => ({ ...d, [k]: v }));
  const faltaNome = !dados.nome.trim();
  const digitosTel = dados.telefone.replace(/\D/g, "");
  const faltaTelefone = dados.tipo !== "mesa" && (digitosTel.length < 10 || digitosTel.length > 13);
  const faltaEndereco = dados.tipo === "entrega" && !dados.endereco.trim();
  const abaixoMinimo = c.config.mostrarPrecos && c.config.pedidoMinimo != null && c.subtotal != null && c.subtotal < c.config.pedidoMinimo;

  // Taxa de entrega: vale para qualquer pedido com entrega (almoço/marmitex e pizzaria).
  const taxa = dados.tipo === "entrega" && c.config.mostrarPrecos ? c.config.taxaEntrega : null;
  const total = c.config.mostrarPrecos && c.subtotal != null ? c.subtotal + (taxa ?? 0) : null;
  const url = linkWhatsApp(montarMensagem(c.itens, dados, c.config.mostrarPrecos, c.config.taxaEntrega), c.config.whatsapp);

  // O botão é um link de verdade com target="_blank": o WhatsApp abre em outra aba e o site continua aberto
  // aqui (nenhum navegador bloqueia, porque é o próprio toque do cliente que abre o link).
  function enviar(e: React.MouseEvent<HTMLAnchorElement>) {
    setTentou(true);
    if (faltaNome || faltaTelefone || faltaEndereco || c.config.pausado) {
      e.preventDefault();
      return;
    }
    try {
      localStorage.setItem(CHAVE_CLIENTE, JSON.stringify({ ...dados, obs: "" }));
    } catch {}
    registrar("enviar_pedido", `${c.totalItens} itens · ${dados.tipo}`);
    // Guarda cliente (nome, telefone, endereço) e o pedido no banco. Não atrapalha o envio se falhar.
    if (supabaseConfigured) {
      supabase.rpc("registrar_pedido", {
        p_nome: dados.nome, p_telefone: dados.telefone, p_tipo: dados.tipo, p_endereco: dados.endereco, p_referencia: dados.referencia,
        p_pagamento: dados.pagamento, p_total: total,
        p_itens: c.itens.map((i) => ({ nome: i.nome, grupo: i.grupo, qtd: i.qtd, preco: c.config.mostrarPrecos ? precoItem(i) : null, adicionais: i.adicionais.map((a) => a.nome), obs: i.obs || undefined })),
      }).then(() => {}, () => {});
    }
    c.salvarUltimo();
    dispensarAvisoSaida();
  }

  if (c.itens.length === 0) {
    return (
      <div className="rounded-md border border-linha bg-creme-200 p-6 text-center">
        <p className="font-serif text-xl font-semibold">Seu pedido está vazio</p>
        <p className="mt-2 text-muted">Escolha no cardápio e toque em Adicionar.</p>
        <div className="mt-5 flex flex-col items-center gap-3">
          <Link href="/cardapio" className="rounded-pill bg-vinho-700 px-6 py-3 font-semibold text-creme-50">Ver cardápio</Link>
          <Link href="/almoco-hoje" className="font-semibold text-vinho-500 underline">Almoço de hoje</Link>
          {c.ultimoPedido.length > 0 && (
            <button type="button" onClick={c.repetirUltimo} className="mt-2 inline-flex items-center gap-2 rounded-pill border border-linha bg-creme-50 px-5 py-3 font-semibold text-ink">
              <History size={20} aria-hidden />Repetir último pedido
            </button>
          )}
        </div>
      </div>
    );
  }

  const campo = "mt-1 w-full rounded-md border border-linha bg-creme-50 p-3 text-base outline-none focus:border-vinho-500";
  return (
    <div className="space-y-8 pb-28">
      {/* Itens */}
      <section aria-labelledby="t-itens">
        <h2 id="t-itens" className="text-2xl font-semibold">Itens</h2>
        <ul className="mt-3 divide-y divide-linha rounded-md border border-linha bg-creme-50">
          {c.itens.map((i) => {
            const valor = c.config.mostrarPrecos ? precoItem(i) : null;
            return (
              <li key={i.chave} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{i.nome}</p>
                    <p className="text-xs text-muted">{i.grupo}</p>
                    {i.adicionais.length > 0 && <p className="mt-1 text-sm text-muted">+ {i.adicionais.map((a) => a.nome).join(", ")}</p>}
                    {i.obs && <p className="mt-1 text-sm text-muted">Obs.: {i.obs}</p>}
                  </div>
                  <button type="button" onClick={() => c.remover(i.chave)} aria-label={`Remover ${i.nome}`} className="rounded-pill p-2 text-muted hover:text-fechado"><Trash2 size={20} /></button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Quantidade valor={i.qtd} onChange={(n) => c.alterarQtd(i.chave, n)} />
                  <span className="font-bold text-vinho-500">{valor != null ? formatarPreco(valor) : "a confirmar"}</span>
                </div>
              </li>
            );
          })}
        </ul>
        {c.config.mostrarPrecos && c.subtotal != null && (
          <dl className="mt-3 space-y-1 rounded-md border border-linha bg-creme-200 p-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{formatarPreco(c.subtotal)}</dd></div>
            {dados.tipo === "entrega" && (
              <div className="flex justify-between"><dt className="text-muted">Taxa de entrega</dt><dd className="font-semibold">{c.config.taxaEntrega != null ? formatarPreco(c.config.taxaEntrega) : "a combinar"}</dd></div>
            )}
            <div className="flex justify-between border-t border-linha pt-1 text-base"><dt className="font-semibold">Total</dt><dd className="font-bold text-vinho-500">{formatarPreco(total ?? c.subtotal)}{c.temSemPreco ? " + a confirmar" : ""}</dd></div>
          </dl>
        )}
        <div className="mt-3 flex items-center justify-between">
          <Link href="/cardapio" className="font-semibold text-vinho-500 underline">+ Adicionar mais itens</Link>
          <button type="button" onClick={c.limpar} className="text-sm text-muted underline">Limpar pedido</button>
        </div>
      </section>

      {/* Dados */}
      <section aria-labelledby="t-dados" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="t-dados" className="text-2xl font-semibold">Seus dados</h2>
          {conta ? (
            <Link href="/conta" className="inline-flex items-center gap-1 text-sm font-semibold text-vinho-500"><UserRound size={16} aria-hidden />Olá, {conta.nome.split(" ")[0]}</Link>
          ) : c.config.clientesCadastro && (
            <Link href="/conta?voltar=/pedido" className="inline-flex items-center gap-1 text-sm font-semibold text-vinho-500 underline"><UserRound size={16} aria-hidden />Tem conta? Entrar</Link>
          )}
        </div>
        <label className="block">
          <span className="font-semibold">Seu nome</span>
          <input value={dados.nome} onChange={(e) => set("nome", e.target.value)} autoComplete="name" className={campo} />
          {tentou && faltaNome && <span className="mt-1 block text-sm font-semibold text-fechado">Digite seu nome</span>}
        </label>
        <label className="block">
          <span className="font-semibold">Seu telefone (WhatsApp){dados.tipo === "mesa" && <span className="font-normal text-muted"> (opcional)</span>}</span>
          <input value={dados.telefone} onChange={(e) => set("telefone", e.target.value)} autoComplete="tel" inputMode="tel" placeholder="37 99999-9999" className={campo} />
          {tentou && faltaTelefone && <span className="mt-1 block text-sm font-semibold text-fechado">Digite seu telefone com DDD</span>}
        </label>

        <fieldset>
          <legend className="font-semibold">Como você quer receber?</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {([["entrega", "Entrega"], ["retirada", "Retirar"], ["mesa", "Na mesa"]] as const).map(([v, t]) => (
              <button key={v} type="button" aria-pressed={dados.tipo === v} onClick={() => set("tipo", v)}
                className={`rounded-pill border px-3 py-3 font-semibold ${dados.tipo === v ? "border-vinho-700 bg-vinho-700 text-creme-50" : "border-linha bg-creme-50 text-ink"}`}>{t}</button>
            ))}
          </div>
        </fieldset>

        {dados.tipo === "entrega" && (
          <>
            <label className="block">
              <span className="font-semibold">Endereço (rua, número e bairro)</span>
              <input value={dados.endereco} onChange={(e) => set("endereco", e.target.value)} autoComplete="street-address" className={campo} />
              {tentou && faltaEndereco && <span className="mt-1 block text-sm font-semibold text-fechado">Digite o endereço de entrega</span>}
            </label>
            <label className="block">
              <span className="font-semibold">Ponto de referência <span className="font-normal text-muted">(opcional)</span></span>
              <input value={dados.referencia} onChange={(e) => set("referencia", e.target.value)} className={campo} />
            </label>
          </>
        )}
        {dados.tipo === "retirada" && <p className="text-sm text-muted">Retire no {NEGOCIO.endereco.rua}, {NEGOCIO.endereco.bairro}.</p>}

        <fieldset>
          <legend className="font-semibold">Forma de pagamento</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {formasPagamento.map((f) => (
              <button key={f} type="button" aria-pressed={dados.pagamento === f} onClick={() => set("pagamento", f)}
                className={`rounded-pill border px-4 py-2.5 text-sm font-semibold ${dados.pagamento === f ? "border-vinho-700 bg-vinho-700 text-creme-50" : "border-linha bg-creme-50 text-ink"}`}>{f}</button>
            ))}
          </div>
        </fieldset>
        {dados.pagamento === "Dinheiro" && (
          <label className="block">
            <span className="font-semibold">Troco para quanto? <span className="font-normal text-muted">(opcional)</span></span>
            <input value={dados.troco} onChange={(e) => set("troco", e.target.value)} inputMode="decimal" placeholder="Ex.: 100" className={campo} />
          </label>
        )}
        <label className="block">
          <span className="font-semibold">Observação do pedido <span className="font-normal text-muted">(opcional)</span></span>
          <textarea value={dados.obs} onChange={(e) => set("obs", e.target.value)} rows={2} className={campo} />
        </label>
        <p className="text-xs text-muted">Guardamos seu nome, telefone e endereço só para agilizar seus próximos pedidos. Não compartilhamos com ninguém. Quer apagar? É só pedir no WhatsApp.</p>
      </section>

      {/* Envio fixo no rodapé (celular) */}
      <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-linha bg-creme-50 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex justify-between gap-3 text-sm">
            <span className="text-muted">{c.totalItens} {c.totalItens === 1 ? "item" : "itens"}{taxa != null ? ` + entrega ${formatarPreco(taxa)}` : ""}</span>
            <span className="font-bold text-ink">
              {total != null ? `Total ${formatarPreco(total)}${c.temSemPreco ? " + a confirmar" : ""}` : "Valor a confirmar"}
            </span>
          </div>
          {c.config.pausado ? (
            <p className="rounded-pill bg-fechado px-5 py-3.5 text-center font-semibold text-creme-50">Pedidos pausados no momento</p>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={enviar} data-sem-rastreio className="flex w-full items-center justify-center gap-2 rounded-pill bg-aberto px-5 py-3.5 text-base font-semibold text-creme-50">
              <MessageCircle size={22} aria-hidden />Enviar pedido no WhatsApp
            </a>
          )}
          {abaixoMinimo && <p className="mt-2 text-center text-xs text-muted">Pedido mínimo para entrega: {formatarPreco(c.config.pedidoMinimo)}</p>}
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { History, MessageCircle, Trash2 } from "lucide-react";
import { precoItem, useCarrinho } from "@/lib/carrinho";
import { montarMensagem, type DadosCliente } from "@/lib/mensagem";
import { formatarPreco, linkWhatsApp, NEGOCIO } from "@/lib/site";
import { registrar } from "@/lib/rastreio";
import { Quantidade } from "./Quantidade";

const CHAVE_CLIENTE = "aconchego:cliente";
const VAZIO: DadosCliente = { nome: "", tipo: "entrega", endereco: "", referencia: "", pagamento: "Pix", troco: "", obs: "" };

export function Checkout({ formasPagamento }: { formasPagamento: string[] }) {
  const c = useCarrinho();
  const [dados, setDados] = useState<DadosCliente>(VAZIO);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    // Lembra nome e endereço do cliente neste aparelho.
    try {
      const salvo = localStorage.getItem(CHAVE_CLIENTE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (salvo) setDados({ ...VAZIO, ...JSON.parse(salvo), obs: "" });
    } catch {}
  }, []);

  const set = <K extends keyof DadosCliente>(k: K, v: DadosCliente[K]) => setDados((d) => ({ ...d, [k]: v }));
  const faltaNome = !dados.nome.trim();
  const faltaEndereco = dados.tipo === "entrega" && !dados.endereco.trim();
  const abaixoMinimo = c.config.mostrarPrecos && c.config.pedidoMinimo != null && c.subtotal != null && c.subtotal < c.config.pedidoMinimo;

  function enviar() {
    setTentou(true);
    if (faltaNome || faltaEndereco || c.config.pausado) return;
    const texto = montarMensagem(c.itens, dados, c.config.mostrarPrecos, c.config.taxaEntrega);
    try {
      localStorage.setItem(CHAVE_CLIENTE, JSON.stringify({ ...dados, obs: "" }));
    } catch {}
    registrar("enviar_pedido", `${c.totalItens} itens · ${dados.tipo}`);
    c.salvarUltimo();
    // Abre o WhatsApp em outra aba: o site continua aberto aqui.
    const url = linkWhatsApp(texto, c.config.whatsapp);
    const aba = window.open(url, "_blank");
    if (aba) aba.opener = null;
    else window.location.assign(url); // navegador bloqueou a nova aba
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
        <div className="mt-3 flex items-center justify-between">
          <Link href="/cardapio" className="font-semibold text-vinho-500 underline">+ Adicionar mais itens</Link>
          <button type="button" onClick={c.limpar} className="text-sm text-muted underline">Limpar pedido</button>
        </div>
      </section>

      {/* Dados */}
      <section aria-labelledby="t-dados" className="space-y-4">
        <h2 id="t-dados" className="text-2xl font-semibold">Seus dados</h2>
        <label className="block">
          <span className="font-semibold">Seu nome</span>
          <input value={dados.nome} onChange={(e) => set("nome", e.target.value)} autoComplete="name" className={campo} />
          {tentou && faltaNome && <span className="mt-1 block text-sm font-semibold text-fechado">Digite seu nome</span>}
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
      </section>

      {/* Envio fixo no rodapé (celular) */}
      <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-linha bg-creme-50 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted">{c.totalItens} {c.totalItens === 1 ? "item" : "itens"}{dados.tipo === "entrega" && c.config.mostrarPrecos && c.config.taxaEntrega != null ? ` · entrega a partir de ${formatarPreco(c.config.taxaEntrega)}` : ""}</span>
            <span className="font-bold text-ink">
              {c.config.mostrarPrecos && c.subtotal != null ? `${formatarPreco(c.subtotal)}${c.temSemPreco ? " + a confirmar" : ""}` : "Valor a confirmar"}
            </span>
          </div>
          {c.config.pausado ? (
            <p className="rounded-pill bg-fechado px-5 py-3.5 text-center font-semibold text-creme-50">Pedidos pausados no momento</p>
          ) : (
            <button type="button" onClick={enviar} className="flex w-full items-center justify-center gap-2 rounded-pill bg-aberto px-5 py-3.5 text-base font-semibold text-creme-50">
              <MessageCircle size={22} aria-hidden />Enviar pedido no WhatsApp
            </button>
          )}
          {abaixoMinimo && <p className="mt-2 text-center text-xs text-muted">Pedido mínimo para entrega: {formatarPreco(c.config.pedidoMinimo)}</p>}
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useCarrinho } from "@/lib/carrinho";
import { emailCliente, traduzirErroConta, useConta, type PedidoConta } from "@/lib/conta";
import { formatarPreco, formatarTelefone, linkWhatsApp } from "@/lib/site";

const campo = "mt-1 w-full rounded-md border border-linha bg-creme-50 p-3 text-base outline-none focus:border-vinho-500";
const botao = "flex min-h-12 w-full items-center justify-center rounded-pill bg-vinho-700 px-5 py-3 font-semibold text-creme-50 disabled:opacity-50";

function voltarDepois() {
  const v = new URLSearchParams(window.location.search).get("voltar");
  if (v && v.startsWith("/") && !v.startsWith("//")) window.location.assign(v);
}

export function ContaCliente() {
  const { config } = useCarrinho();
  const { conta, carregando, sair, recarregar, supabase } = useConta();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [f, setF] = useState({ nome: "", telefone: "", senha: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  if (carregando) return <p className="text-muted">Carregando…</p>;
  if (conta) return <AreaDoCliente conta={conta} supabase={supabase} onSair={sair} recarregar={recarregar} />;

  async function entrar() {
    setErro(null);
    if (f.telefone.replace(/\D/g, "").length < 10) return setErro("Digite o telefone com DDD.");
    setEnviando(true);
    if (modo === "criar") {
      const { error } = await supabase.rpc("criar_conta_cliente", { p_nome: f.nome, p_telefone: f.telefone, p_senha: f.senha });
      if (error) { setEnviando(false); return setErro(traduzirErroConta(error.message)); }
    }
    const { error } = await supabase.auth.signInWithPassword({ email: emailCliente(f.telefone), password: f.senha });
    setEnviando(false);
    if (error) return setErro(traduzirErroConta(error.message));
    recarregar();
    voltarDepois();
  }

  const podeCriar = config.clientesCadastro;
  return (
    <div className="rounded-md border border-linha bg-creme-50 p-5">
      {podeCriar && (
        <div role="tablist" className="mb-5 flex rounded-pill border border-linha bg-creme-200 p-1">
          {([["entrar", "Entrar"], ["criar", "Criar conta"]] as const).map(([m, t]) => (
            <button key={m} type="button" role="tab" aria-selected={modo === m} onClick={() => { setModo(m); setErro(null); }}
              className={`flex-1 rounded-pill py-2.5 font-semibold ${modo === m ? "bg-vinho-700 text-creme-50" : "text-ink"}`}>{t}</button>
          ))}
        </div>
      )}
      {!podeCriar && <p className="mb-4 text-sm text-muted">O cadastro de novas contas está fechado no momento. Quem já tem conta pode entrar.</p>}
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); entrar(); }}>
        {modo === "criar" && (
          <label className="block"><span className="font-semibold">Seu nome</span>
            <input value={f.nome} onChange={(e) => set("nome", e.target.value)} autoComplete="name" className={campo} /></label>
        )}
        <label className="block"><span className="font-semibold">Telefone (WhatsApp)</span>
          <input value={f.telefone} onChange={(e) => set("telefone", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="37 99999-9999" className={campo} /></label>
        <label className="block"><span className="font-semibold">Senha</span>
          {modo === "criar" && <span className="block text-sm text-muted">Mínimo 6 caracteres.</span>}
          <input type="password" value={f.senha} onChange={(e) => set("senha", e.target.value)} autoComplete={modo === "criar" ? "new-password" : "current-password"} className={campo} /></label>
        {erro && <p role="alert" className="rounded-md bg-fechado px-4 py-3 text-sm font-semibold text-creme-50">{erro}</p>}
        <button type="submit" disabled={enviando} className={botao}>{enviando ? "Aguarde…" : modo === "criar" ? "Criar minha conta" : "Entrar"}</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Esqueceu a senha? <a href={linkWhatsApp("Olá! Esqueci a senha da minha conta no site do Aconchego.", config.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-vinho-500 underline">Fale com a gente</a>
      </p>
      <p className="mt-2 text-center text-sm"><Link href="/pedido" className="text-muted underline">Pedir sem conta</Link></p>
    </div>
  );
}

type Conta = ReturnType<typeof useConta>;
function AreaDoCliente({ conta, supabase, onSair, recarregar }: { conta: NonNullable<Conta["conta"]>; supabase: Conta["supabase"]; onSair: () => void; recarregar: () => void }) {
  const [f, setF] = useState({ nome: conta.nome, endereco: conta.endereco ?? "", referencia: conta.referencia ?? "" });
  const [pedidos, setPedidos] = useState<PedidoConta[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("pedidos").select("id,criado_em,tipo,total,itens").eq("cliente_id", conta.id).order("criado_em", { ascending: false }).limit(10)
      .then(({ data }) => setPedidos((data as PedidoConta[]) ?? []));
  }, [conta, supabase]);

  async function salvar() {
    const { error } = await supabase.rpc("atualizar_meus_dados", { p_nome: f.nome, p_endereco: f.endereco, p_referencia: f.referencia });
    setMsg(error ? traduzirErroConta(error.message) : "Dados salvos.");
    if (!error) recarregar();
  }
  return (
    <div className="space-y-8">
      <section className="rounded-md border border-linha bg-creme-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-2xl font-semibold">Olá, {conta.nome.split(" ")[0]}!</p>
            {conta.telefone && <p className="text-sm text-muted">{formatarTelefone(conta.telefone)}</p>}
          </div>
          <button type="button" onClick={onSair} className="inline-flex items-center gap-1 rounded-pill border border-linha px-3 py-2 text-sm font-semibold"><LogOut size={16} />Sair</button>
        </div>
        <Link href="/pedido" className="mt-4 flex min-h-12 items-center justify-center rounded-pill bg-aberto px-5 py-3 font-semibold text-creme-50">Fazer pedido</Link>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Meus dados</h2>
        <label className="block"><span className="font-semibold">Nome</span><input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={campo} /></label>
        <label className="block"><span className="font-semibold">Endereço de entrega</span><input value={f.endereco} onChange={(e) => setF({ ...f, endereco: e.target.value })} placeholder="Rua, número e bairro" className={campo} /></label>
        <label className="block"><span className="font-semibold">Ponto de referência</span><input value={f.referencia} onChange={(e) => setF({ ...f, referencia: e.target.value })} className={campo} /></label>
        {msg && <p role="status" className="text-sm font-semibold text-aberto">{msg}</p>}
        <button type="button" onClick={salvar} className={botao}>Salvar meus dados</button>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Meus últimos pedidos</h2>
        {pedidos.length === 0 ? <p className="mt-2 text-muted">Nenhum pedido ainda.</p> : (
          <ul className="mt-3 divide-y divide-linha rounded-md border border-linha bg-creme-50">
            {pedidos.map((p) => (
              <li key={p.id} className="p-4">
                <p className="flex justify-between text-sm"><span className="font-semibold">{new Date(p.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>{p.total != null && <span className="font-bold text-vinho-500">{formatarPreco(p.total)}</span>}</p>
                <p className="mt-1 text-sm text-muted">{p.itens.map((i) => `${i.qtd}x ${i.nome}`).join(", ")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

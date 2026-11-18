"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, KeyRound, MessageCircle, Trash2, UserRound } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { useSessao } from "@/lib/admin/sessao";
import { combina } from "@/lib/admin/texto";
import { createClient } from "@/lib/supabase/client";
import { formatarPreco, formatarTelefone } from "@/lib/site";
import { Sheet } from "@/components/Sheet";
import { Ajuda, Aviso, Botao, Campo, campoCls, Chave, Titulo, traduzirErro } from "./ui";

type Cliente = { id: string; nome: string; telefone: string | null; endereco: string | null; referencia: string | null; conta_id: string | null; total_pedidos: number; ultimo_pedido_em: string | null; criado_em: string };
type Pedido = { id: number; criado_em: string; tipo: string; total: number | null; pagamento: string | null; itens: { nome: string; qtd: number }[] };

const data = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—");

export function ClientesAdmin() {
  const { pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [cadastro, setCadastro] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const [senhaDe, setSenhaDe] = useState<Cliente | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);
  const [pedidos30, setPedidos30] = useState(0);

  const carregar = useCallback(async () => {
    const desde = new Date(Date.now() - 30 * 864e5).toISOString();
    const [{ data: c }, { data: cfg }, { count }] = await Promise.all([
      supabase.from("clientes").select("*").order("ultimo_pedido_em", { ascending: false, nullsFirst: false }).limit(2000),
      supabase.from("configuracoes").select("clientes_cadastro").eq("id", 1).single(),
      supabase.from("pedidos").select("id", { count: "exact", head: true }).gte("criado_em", desde),
    ]);
    setLista((c as Cliente[]) ?? []);
    setCadastro(!!cfg?.clientes_cadastro);
    setPedidos30(count ?? 0);
  }, [supabase]);
  useEffect(() => {
    // Busca vinda da barra de pesquisa do painel (?q=…)
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) setBusca(q);
    carregar();
  }, [carregar]);

  if (!pode("dono", "gerente")) return <p className="text-muted">Sem acesso a esta página.</p>;

  const filtrados = busca.trim() ? lista.filter((c) => combina(busca, c.nome, c.telefone, c.endereco, c.referencia)) : lista;

  async function alternarCadastro(v: boolean) {
    const { error } = await supabase.from("configuracoes").update({ clientes_cadastro: v }).eq("id", 1);
    if (error) return setMsg({ tipo: "erro", txt: traduzirErro(error.message) });
    setCadastro(v);
    await atualizarSite(["config"]);
    setMsg({ tipo: "ok", txt: v ? "Pronto: clientes já podem criar conta no site." : "Cadastro de clientes desligado. Quem já tem conta continua entrando." });
  }
  async function apagar(c: Cliente) {
    if (!window.confirm(`Apagar ${c.nome} e o histórico de pedidos? Use quando o cliente pedir para sair do cadastro.`)) return;
    const { error } = await supabase.rpc("apagar_cliente", { p_cliente: c.id });
    if (error) return setMsg({ tipo: "erro", txt: traduzirErro(error.message) });
    setMsg({ tipo: "ok", txt: `${c.nome} apagado(a).` });
    carregar();
  }
  function exportar() {
    const linhas = [["Nome", "Telefone", "Endereço", "Referência", "Pedidos", "Último pedido", "Tem conta"],
      ...filtrados.map((c) => [c.nome, c.telefone ? formatarTelefone(c.telefone) : "", c.endereco ?? "", c.referencia ?? "", String(c.total_pedidos), data(c.ultimo_pedido_em), c.conta_id ? "sim" : "não"])];
    const csv = "﻿" + linhas.map((l) => l.map((v) => `"${v.replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `clientes-aconchego-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <>
      <Titulo sub="Quem já pediu pelo site: nome, telefone e endereço.">Clientes</Titulo>
      <Ajuda passos={[
        <>Todo pedido enviado pelo site guarda o cliente aqui, sozinho. Se ele pedir de novo, o cadastro é atualizado.</>,
        <>Use a <b>busca</b> para achar por nome, telefone ou rua. Toque no cliente para ver os pedidos.</>,
        <>O botão <b>verde</b> abre a conversa dele no WhatsApp.</>,
      ]} dicas={[
        "Cliente pediu para sair do cadastro? Toque em Apagar (lei de proteção de dados).",
        "Conta no site é opcional: ninguém precisa de conta para pedir.",
      ]} />

      <div className="grid grid-cols-3 gap-2 text-center">
        {[["Clientes", lista.length], ["Com conta", lista.filter((c) => c.conta_id).length], ["Pedidos (30 dias)", pedidos30]].map(([r, v]) => (
          <div key={r} className="rounded-md border border-linha bg-creme-50 p-3"><p className="text-2xl font-bold text-vinho-700">{v}</p><p className="text-xs text-muted">{r}</p></div>
        ))}
      </div>

      <div className="mt-4">
        <Chave ligado={cadastro} onChange={alternarCadastro} rotulo={cadastro ? "Clientes podem criar conta no site" : "Cadastro de clientes desligado"}
          descricao="Com conta, o cliente entra com telefone e senha e os dados já vêm preenchidos. Pedir sem conta continua funcionando sempre." />
      </div>
      {msg && <div className="mt-4"><Aviso tipo={msg.tipo}>{msg.txt}</Aviso></div>}

      <div className="mt-6 flex gap-2">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome, telefone ou rua…" aria-label="Buscar cliente" className={`${campoCls} mt-0 flex-1`} />
        <button type="button" onClick={exportar} aria-label="Baixar planilha" title="Baixar planilha (Excel)" className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-pill border border-linha bg-creme-50"><Download size={20} /></button>
      </div>
      <p className="mt-2 text-sm text-muted">{filtrados.length} {filtrados.length === 1 ? "cliente" : "clientes"}</p>

      <ul className="mt-3 space-y-2">
        {filtrados.map((c) => (
          <li key={c.id} className="rounded-md border border-linha bg-creme-50">
            <div className="flex items-start gap-3 p-4">
              <button type="button" onClick={() => setAberto(aberto === c.id ? null : c.id)} aria-expanded={aberto === c.id} className="min-w-0 flex-1 text-left">
                <p className="flex items-center gap-1.5 font-semibold text-ink">{c.nome}{c.conta_id && <UserRound size={14} className="text-vinho-500" aria-label="Tem conta no site" />}</p>
                <p className="text-sm text-muted">{[c.telefone && formatarTelefone(c.telefone), c.endereco].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 text-xs text-muted">{c.total_pedidos} {c.total_pedidos === 1 ? "pedido" : "pedidos"} · último em {data(c.ultimo_pedido_em)}
                  <ChevronDown size={14} className={`ml-1 inline transition ${aberto === c.id ? "rotate-180" : ""}`} aria-hidden /></p>
              </button>
              {c.telefone && (
                <a href={`https://wa.me/${c.telefone}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${c.nome}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-aberto text-creme-50"><MessageCircle size={20} /></a>
              )}
            </div>
            {aberto === c.id && <Detalhe cliente={c} onSenha={() => setSenhaDe(c)} onApagar={pode("dono") ? () => apagar(c) : undefined} />}
          </li>
        ))}
      </ul>
      {lista.length === 0 && <p className="mt-6 text-center text-muted">Ainda não há clientes. Eles aparecem aqui quando alguém enviar um pedido pelo site.</p>}
      {senhaDe && <SenhaCliente cliente={senhaDe} onFechar={() => setSenhaDe(null)} onOk={() => { setSenhaDe(null); setMsg({ tipo: "ok", txt: "Senha do cliente trocada. Passe a nova senha para ele no WhatsApp." }); }} />}
    </>
  );
}

function Detalhe({ cliente, onSenha, onApagar }: { cliente: Cliente; onSenha: () => void; onApagar?: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  useEffect(() => {
    supabase.from("pedidos").select("id,criado_em,tipo,total,pagamento,itens").eq("cliente_id", cliente.id).order("criado_em", { ascending: false }).limit(20)
      .then(({ data }) => setPedidos((data as Pedido[]) ?? []));
  }, [supabase, cliente.id]);
  return (
    <div className="space-y-3 border-t border-linha px-4 pb-4 pt-3">
      {cliente.referencia && <p className="text-sm"><b>Referência:</b> {cliente.referencia}</p>}
      <p className="text-sm text-muted">Cliente desde {data(cliente.criado_em)}</p>
      {pedidos == null ? <p className="text-sm text-muted">Carregando pedidos…</p> : pedidos.length === 0 ? <p className="text-sm text-muted">Sem pedidos.</p> : (
        <ul className="divide-y divide-linha rounded-md border border-linha">
          {pedidos.map((p) => (
            <li key={p.id} className="p-3 text-sm">
              <p className="flex justify-between gap-2"><span className="font-semibold">{new Date(p.criado_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · {p.tipo}</span>{p.total != null && <b className="text-vinho-500">{formatarPreco(p.total)}</b>}</p>
              <p className="text-muted">{p.itens.map((i) => `${i.qtd}x ${i.nome}`).join(", ")}{p.pagamento ? ` · ${p.pagamento}` : ""}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-4">
        {cliente.conta_id && <button type="button" onClick={onSenha} className="inline-flex items-center gap-1 text-sm font-semibold text-vinho-500"><KeyRound size={16} />Nova senha da conta</button>}
        {onApagar && <button type="button" onClick={onApagar} className="inline-flex items-center gap-1 text-sm font-semibold text-fechado"><Trash2 size={16} />Apagar cliente</button>}
      </div>
    </div>
  );
}

function SenhaCliente({ cliente, onFechar, onOk }: { cliente: Cliente; onFechar: () => void; onOk: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  async function salvar() {
    const { error } = await supabase.rpc("redefinir_senha_cliente", { p_cliente: cliente.id, p_senha: senha });
    if (error) return setErro(traduzirErro(error.message));
    onOk();
  }
  return (
    <Sheet aberto titulo={`Nova senha – ${cliente.nome}`} onFechar={onFechar} rodape={<Botao className="w-full" onClick={salvar}>Salvar senha</Botao>}>
      <Campo rotulo="Nova senha do cliente" dica="Mínimo 6 caracteres. Depois mande para ele no WhatsApp." value={senha} onChange={(e) => setSenha(e.target.value)} />
      {erro && <div className="mt-4"><Aviso tipo="erro">{erro}</Aviso></div>}
    </Sheet>
  );
}

"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { NOME_PERFIL, useSessao, type Membro, type Perfil } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { formatarTelefone } from "@/lib/site";
import { Sheet } from "@/components/Sheet";
import { Ajuda, Aviso, Botao, Campo, campoCls, Chave, Titulo, traduzirErro } from "./ui";

const DESCRICAO: Record<Perfil, string> = {
  dono: "Faz tudo, inclusive cadastrar a equipe",
  gerente: "Cardápio, preços, almoço, ajustes",
  social: "Almoço do dia, promoções e fotos",
  atendente: "Só liga/desliga produtos e pausa pedidos",
};

export function EquipeAdmin() {
  const { membro, pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Membro[]>([]);
  const [novo, setNovo] = useState(false);
  const [senhaDe, setSenhaDe] = useState<Membro | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("equipe").select("id,nome,telefone,usuario,email,perfil,ativo").order("criado_em");
    setLista((data as Membro[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  if (!pode("dono")) return <p className="text-muted">Só o dono gerencia a equipe.</p>;

  async function alternar(m: Membro) {
    const { error } = await supabase.rpc("definir_ativo", { p_id: m.id, p_ativo: !m.ativo });
    if (error) return setMsg({ tipo: "erro", txt: traduzirErro(error.message) });
    carregar();
  }
  async function trocarPerfil(m: Membro, perfil: Perfil) {
    const { error } = await supabase.from("equipe").update({ perfil }).eq("id", m.id);
    if (error) return setMsg({ tipo: "erro", txt: traduzirErro(error.message) });
    carregar();
  }

  return (
    <>
      <Titulo sub="Cada pessoa entra com o telefone (ou usuário/e-mail) e uma senha.">Equipe</Titulo>
      <Ajuda passos={[
        <>Toque em <b>Cadastrar pessoa</b>, preencha nome, telefone e uma senha, e escolha <b>o que ela pode fazer</b>.</>,
        <>Passe para a pessoa: o endereço <b>{typeof window !== "undefined" ? window.location.host : ""}/admin</b>, o telefone e a senha.</>,
        <>Esqueceu a senha? Toque em <b>Senha</b> ao lado do nome e crie uma nova.</>,
        <>Alguém saiu da equipe? Desligue <b>Acesso liberado</b>. A pessoa não entra mais, e o que ela fez continua no histórico.</>,
      ]} dicas={[
        "Dono(a): faz tudo. Gerente: cardápio, preços, almoço e ajustes. Social media: almoço, fotos e novidades. Atendente: só liga e desliga itens e pausa pedidos.",
        "Dê para cada pessoa só o acesso que ela precisa.",
      ]} />
      <Botao className="w-full" onClick={() => setNovo(true)}><UserPlus size={20} />Cadastrar pessoa</Botao>
      {msg && <div className="mt-4"><Aviso tipo={msg.tipo}>{msg.txt}</Aviso></div>}
      <ul className="mt-6 space-y-3">
        {lista.map((m) => (
          <li key={m.id} className={`rounded-md border border-linha bg-creme-50 p-4 ${m.ativo ? "" : "opacity-60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.nome}{m.id === membro?.id && " (você)"}</p>
                <p className="text-sm text-muted">{[m.telefone && formatarTelefone(m.telefone), m.usuario && `@${m.usuario}`, m.email].filter(Boolean).join(" · ")}</p>
              </div>
              <button type="button" onClick={() => setSenhaDe(m)} className="inline-flex items-center gap-1 rounded-pill border border-linha px-3 py-2 text-sm font-semibold"><KeyRound size={16} />Senha</button>
            </div>
            {m.id !== membro?.id && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select value={m.perfil} onChange={(e) => trocarPerfil(m, e.target.value as Perfil)} aria-label={`Perfil de ${m.nome}`} className={`${campoCls} mt-0`}>
                  {(Object.keys(NOME_PERFIL) as Perfil[]).map((p) => <option key={p} value={p}>{NOME_PERFIL[p]}</option>)}
                </select>
                <Chave ligado={m.ativo} onChange={() => alternar(m)} rotulo={m.ativo ? "Acesso liberado" : "Acesso bloqueado"} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {novo && <NovoMembro onFechar={() => setNovo(false)} onCriado={(n) => { setNovo(false); setMsg({ tipo: "ok", txt: `${n} cadastrado(a). Passe o telefone e a senha para a pessoa.` }); carregar(); }} />}
      {senhaDe && <NovaSenha membro={senhaDe} onFechar={() => setSenhaDe(null)} onOk={() => { setSenhaDe(null); setMsg({ tipo: "ok", txt: "Senha trocada." }); }} />}
    </>
  );
}

function NovoMembro({ onFechar, onCriado }: { onFechar: () => void; onCriado: (nome: string) => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [f, setF] = useState({ nome: "", telefone: "", usuario: "", email: "", senha: "", perfil: "atendente" as Perfil });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  async function criar() {
    setErro(null);
    setSalvando(true);
    const { error } = await supabase.rpc("criar_membro", {
      p_nome: f.nome, p_senha: f.senha, p_perfil: f.perfil,
      p_telefone: f.telefone || null, p_usuario: f.usuario || null, p_email: f.email || null,
    });
    setSalvando(false);
    if (error) return setErro(traduzirErro(error.message));
    onCriado(f.nome);
  }

  return (
    <Sheet aberto titulo="Cadastrar pessoa" onFechar={onFechar} rodape={<Botao className="w-full" disabled={salvando} onClick={criar}>{salvando ? "Cadastrando…" : "Cadastrar"}</Botao>}>
      <div className="space-y-5">
        <Campo rotulo="Nome" value={f.nome} onChange={(e) => set("nome", e.target.value)} />
        <Campo rotulo="Telefone (WhatsApp)" dica="É com ele que a pessoa vai entrar." inputMode="tel" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="37 99999-9999" />
        <Campo rotulo="Senha inicial" dica="Mínimo 6 caracteres. Pode ser um número de 6 dígitos." value={f.senha} onChange={(e) => set("senha", e.target.value)} />
        <fieldset>
          <legend className="font-semibold">O que essa pessoa pode fazer?</legend>
          <div className="mt-2 space-y-2">
            {(Object.keys(NOME_PERFIL) as Perfil[]).map((p) => (
              <label key={p} className="flex cursor-pointer items-start gap-3 rounded-md border border-linha p-3 has-[:checked]:border-vinho-700">
                <input type="radio" name="perfil" checked={f.perfil === p} onChange={() => set("perfil", p)} className="mt-1 h-5 w-5 accent-vinho-700" />
                <span><b>{NOME_PERFIL[p]}</b><span className="block text-sm text-muted">{DESCRICAO[p]}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        <details>
          <summary className="cursor-pointer font-semibold text-vinho-500">Outras formas de entrar (opcional)</summary>
          <div className="mt-3 space-y-4">
            <Campo rotulo="Nome de usuário" value={f.usuario} onChange={(e) => set("usuario", e.target.value)} autoCapitalize="none" placeholder="ex.: maria" />
            <Campo rotulo="E-mail" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
          </div>
        </details>
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
      </div>
    </Sheet>
  );
}

function NovaSenha({ membro, onFechar, onOk }: { membro: Membro; onFechar: () => void; onOk: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  async function salvar() {
    const { error } = await supabase.rpc("redefinir_senha", { p_id: membro.id, p_senha: senha });
    if (error) return setErro(traduzirErro(error.message));
    onOk();
  }
  return (
    <Sheet aberto titulo={`Nova senha – ${membro.nome}`} onFechar={onFechar} rodape={<Botao className="w-full" onClick={salvar}>Salvar senha</Botao>}>
      <Campo rotulo="Nova senha" dica="Mínimo 6 caracteres." value={senha} onChange={(e) => setSenha(e.target.value)} />
      {erro && <div className="mt-4"><Aviso tipo="erro">{erro}</Aviso></div>}
    </Sheet>
  );
}

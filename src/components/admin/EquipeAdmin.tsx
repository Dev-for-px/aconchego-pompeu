"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, Pencil, Trash2, UserPlus } from "lucide-react";
import { NOME_PERFIL, useSessao, type Membro, type Perfil } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { formatarTelefone } from "@/lib/site";
import { Sheet } from "@/components/Sheet";
import { Ajuda, Aviso, Botao, Campo, campoCls, Chave, Titulo, traduzirErro } from "./ui";

const DESCRICAO: Record<Perfil, string> = {
  dono: "Faz tudo, inclusive cadastrar e remover a equipe",
  gerente: "Cardápio, preços, almoço, clientes e ajustes",
  social: "Almoço do dia, promoções e fotos",
  atendente: "Só liga/desliga produtos e pausa pedidos",
};

/** Usuário: minúsculo, sem acento e sem espaço (ex.: "Maria Souza" → "maria.souza"). */
const limparUsuario = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9._]/g, "").slice(0, 30);
const soDigitos = (s: string) => s.replace(/\D/g, "");
const telefoneBanco = (s: string) => { const d = soDigitos(s); return !d ? null : d.length === 10 || d.length === 11 ? `55${d}` : d; };

export function EquipeAdmin() {
  const { membro, pode, consultoria } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Membro[]>([]);
  const [novo, setNovo] = useState(false);
  const [editar, setEditar] = useState<Membro | null>(null);
  const [senhaDe, setSenhaDe] = useState<Membro | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("equipe").select("id,nome,telefone,usuario,email,perfil,ativo,consultoria").order("criado_em");
    setLista((data as Membro[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  if (!pode("dono")) return <p className="text-muted">Só o dono gerencia a equipe.</p>;

  const erro = (e: { message: string } | null) => { if (e) { setMsg({ tipo: "erro", txt: traduzirErro(e.message) }); return true; } return false; };
  async function alternar(m: Membro) {
    if (erro((await supabase.rpc("definir_ativo", { p_id: m.id, p_ativo: !m.ativo })).error)) return;
    carregar();
  }
  async function trocarPerfil(m: Membro, perfil: Perfil) {
    if (erro((await supabase.from("equipe").update({ perfil }).eq("id", m.id)).error)) return;
    carregar();
  }
  async function remover(m: Membro) {
    if (!window.confirm(`Remover ${m.nome} da equipe? A pessoa perde o acesso de vez. O que ela fez continua no site.`)) return;
    if (erro((await supabase.rpc("remover_membro", { p_id: m.id })).error)) return;
    setMsg({ tipo: "ok", txt: `${m.nome} foi removido(a) da equipe.` });
    carregar();
  }

  return (
    <>
      <Titulo sub="Cada pessoa entra com o usuário (ou telefone/e-mail) e uma senha.">Equipe</Titulo>
      <Ajuda passos={[
        <>Toque em <b>Cadastrar pessoa</b>: preencha <b>usuário</b>, nome e senha. Telefone e e-mail são opcionais.</>,
        <>Passe para a pessoa: o endereço <b>{typeof window !== "undefined" ? window.location.host : ""}/admin</b>, o usuário e a senha.</>,
        <>Esqueceu a senha? Toque em <b>Senha</b> e crie uma nova.</>,
        <>Saiu por um tempo? Desligue <b>Acesso liberado</b>. Saiu de vez? Toque em <b>Remover</b>.</>,
      ]} dicas={[
        "Dono(a): faz tudo. Gerente: cardápio, preços, almoço, clientes e ajustes. Social media: almoço, fotos e novidades. Atendente: só liga e desliga itens e pausa pedidos.",
        "Quem tem o selo Consultoria PHAR cuida do site e do Google: não pode ser removido nem alterado por aqui.",
      ]} />
      <Botao className="w-full" onClick={() => setNovo(true)}><UserPlus size={20} />Cadastrar pessoa</Botao>
      {msg && <div className="mt-4"><Aviso tipo={msg.tipo}>{msg.txt}</Aviso></div>}
      <ul className="mt-6 space-y-3">
        {lista.map((m) => {
          const eu = m.id === membro?.id;
          const travado = m.consultoria && !consultoria; // consultoria só mexe nela mesma
          return (
            <li key={m.id} className={`rounded-md border border-linha bg-creme-50 p-4 ${m.ativo ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{m.nome}{eu && " (você)"}</p>
                  <p className="text-sm text-muted">{[m.usuario && `@${m.usuario}`, m.telefone && formatarTelefone(m.telefone), m.email].filter(Boolean).join(" · ")}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-pill bg-creme-200 px-2 py-0.5 text-ink">{NOME_PERFIL[m.perfil]}</span>
                    {m.consultoria && <span className="inline-flex items-center gap-1 rounded-pill bg-vinho-700 px-2 py-0.5 text-creme-50"><Lock size={12} aria-hidden />Consultoria PHAR</span>}
                  </p>
                </div>
                {!travado && (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setEditar(m)} aria-label={`Editar dados de ${m.nome}`} className="rounded-pill border border-linha p-2.5"><Pencil size={16} /></button>
                    <button type="button" onClick={() => setSenhaDe(m)} className="inline-flex items-center gap-1 rounded-pill border border-linha px-3 py-2 text-sm font-semibold"><KeyRound size={16} />Senha</button>
                  </div>
                )}
              </div>
              {travado ? (
                <p className="mt-3 text-sm text-muted">Protegido: só a consultoria altera este acesso.</p>
              ) : !eu && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <select value={m.perfil} onChange={(e) => trocarPerfil(m, e.target.value as Perfil)} aria-label={`Perfil de ${m.nome}`} className={`${campoCls} mt-0`}>
                    {(Object.keys(NOME_PERFIL) as Perfil[]).map((p) => <option key={p} value={p}>{NOME_PERFIL[p]}</option>)}
                  </select>
                  <Chave ligado={m.ativo} onChange={() => alternar(m)} rotulo={m.ativo ? "Acesso liberado" : "Acesso bloqueado"} />
                  <button type="button" onClick={() => remover(m)} className="inline-flex items-center gap-1 justify-self-start text-sm font-semibold text-fechado sm:col-span-2"><Trash2 size={16} />Remover da equipe</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {novo && <FormMembro onFechar={() => setNovo(false)} onOk={(t) => { setNovo(false); setMsg({ tipo: "ok", txt: t }); carregar(); }} />}
      {editar && <FormMembro membro={editar} onFechar={() => setEditar(null)} onOk={(t) => { setEditar(null); setMsg({ tipo: "ok", txt: t }); carregar(); }} />}
      {senhaDe && <NovaSenha membro={senhaDe} onFechar={() => setSenhaDe(null)} onOk={() => { setSenhaDe(null); setMsg({ tipo: "ok", txt: "Senha trocada." }); }} />}
    </>
  );
}

function CampoSenha({ valor, onChange, rotulo }: { valor: string; onChange: (v: string) => void; rotulo: string }) {
  const [ver, setVer] = useState(true);
  return (
    <label className="block">
      <span className="font-semibold text-ink">{rotulo} <span className="text-fechado">*</span></span>
      <span className="block text-sm text-muted">Mínimo 6 caracteres. Pode ser um número de 6 dígitos.</span>
      <span className="relative block">
        <input type={ver ? "text" : "password"} value={valor} onChange={(e) => onChange(e.target.value)} autoComplete="new-password" className={`${campoCls} pr-12`} />
        <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 p-2 text-muted">{ver ? <EyeOff size={20} /> : <Eye size={20} />}</button>
      </span>
    </label>
  );
}

/** Cadastrar (sem `membro`) ou editar dados (com `membro`). Usuário obrigatório; telefone e e-mail opcionais. */
function FormMembro({ membro, onFechar, onOk }: { membro?: Membro; onFechar: () => void; onOk: (texto: string) => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [f, setF] = useState({
    usuario: membro?.usuario ?? "", nome: membro?.nome ?? "",
    telefone: membro?.telefone ? formatarTelefone(membro.telefone) : "", email: membro?.email ?? "",
    senha: "", perfil: (membro?.perfil ?? "atendente") as Perfil,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const tel = soDigitos(f.telefone);

  async function salvar() {
    setErro(null);
    if (f.usuario.length < 3) return setErro("Escolha um usuário com pelo menos 3 letras.");
    if (!f.nome.trim()) return setErro("Digite o nome.");
    if (tel && tel.length < 10) return setErro("Telefone incompleto: use DDD + número.");
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErro("E-mail inválido.");
    if (!membro && f.senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setSalvando(true);
    const { error } = membro
      ? await supabase.from("equipe").update({ usuario: f.usuario, nome: f.nome.trim(), telefone: telefoneBanco(f.telefone), email: f.email.trim().toLowerCase() || null }).eq("id", membro.id)
      : await supabase.rpc("criar_membro", {
        p_nome: f.nome.trim(), p_senha: f.senha, p_perfil: f.perfil,
        p_telefone: tel || null, p_usuario: f.usuario, p_email: f.email.trim() || null,
      });
    setSalvando(false);
    if (error) return setErro(traduzirErro(error.message));
    onOk(membro ? "Dados atualizados." : `${f.nome} cadastrado(a). Passe o usuário @${f.usuario} e a senha para a pessoa.`);
  }

  return (
    <Sheet aberto titulo={membro ? `Editar – ${membro.nome}` : "Cadastrar pessoa"} onFechar={onFechar}
      rodape={<Botao className="w-full" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : membro ? "Salvar dados" : "Cadastrar"}</Botao>}>
      <div className="space-y-5">
        <label className="block">
          <span className="font-semibold text-ink">Usuário <span className="text-fechado">*</span></span>
          <span className="block text-sm text-muted">É com ele que a pessoa entra. Sem espaço e sem acento.</span>
          <span className="relative block">
            <span className="absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-muted">@</span>
            <input value={f.usuario} onChange={(e) => set("usuario", limparUsuario(e.target.value))} autoCapitalize="none" autoComplete="off" placeholder="maria" className={`${campoCls} pl-8`} />
          </span>
        </label>
        <Campo rotulo="Nome *" value={f.nome} onChange={(e) => set("nome", e.target.value)} onBlur={() => { if (!membro && !f.usuario && f.nome) set("usuario", limparUsuario(f.nome.split(" ")[0])); }} placeholder="Maria Souza" />
        <Campo rotulo="Telefone (opcional)" dica="Também serve para entrar. Com DDD." inputMode="tel" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="37 99999-9999" />
        <Campo rotulo="E-mail (opcional)" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoCapitalize="none" placeholder="maria@email.com" />
        {!membro && <CampoSenha rotulo="Senha" valor={f.senha} onChange={(v) => set("senha", v)} />}
        {!membro && (
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
        )}
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
      <CampoSenha rotulo="Nova senha" valor={senha} onChange={setSenha} />
      {erro && <div className="mt-4"><Aviso tipo="erro">{erro}</Aviso></div>}
    </Sheet>
  );
}

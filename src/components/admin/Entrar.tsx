"use client";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { Aviso, Botao, campoCls, traduzirErro } from "./ui";

export function Entrar() {
  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const supabase = createClient();
    const { data: email, error: e1 } = await supabase.rpc("email_para_login", { identificador: id });
    if (e1 || !email) {
      setErro("Não encontramos ninguém com esse telefone, usuário ou e-mail.");
      setEnviando(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro(traduzirErro(error.message));
      setEnviando(false);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-vinho-700 px-4 py-10">
      <Logo variante="branca" altura={72} prioridade />
      <form onSubmit={entrar} className="mt-8 w-full max-w-sm space-y-5 rounded-md bg-creme-50 p-6">
        <h1 className="text-center text-2xl font-bold">Entrar no painel</h1>
        <label className="block">
          <span className="font-semibold">Telefone, e-mail ou usuário</span>
          <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" autoCapitalize="none" required className={campoCls} placeholder="Ex.: 37 99999-9999" />
        </label>
        <label className="block">
          <span className="font-semibold">Senha</span>
          <span className="relative block">
            <input value={senha} onChange={(e) => setSenha(e.target.value)} type={ver ? "text" : "password"} autoComplete="current-password" required className={`${campoCls} pr-12`} />
            <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder senha" : "Mostrar senha"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted">
              {ver ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </span>
        </label>
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
        <Botao type="submit" disabled={enviando} className="w-full">{enviando ? "Entrando…" : "Entrar"}</Botao>
        <p className="text-center text-sm text-muted">Esqueceu a senha? Peça para o dono trocar no painel.</p>
      </form>
    </div>
  );
}

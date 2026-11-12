"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export type Perfil = "dono" | "gerente" | "social" | "atendente";
export type Membro = { id: string; nome: string; telefone: string | null; usuario: string | null; email: string | null; perfil: Perfil; ativo: boolean };

type Ctx = { membro: Membro | null; carregando: boolean; sair: () => Promise<void>; pode: (...perfis: Perfil[]) => boolean; recarregar: () => void };
const C = createContext<Ctx | null>(null);

export const NOME_PERFIL: Record<Perfil, string> = { dono: "Dono(a)", gerente: "Gerente", social: "Social media", atendente: "Atendente" };

export function SessaoProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [membro, setMembro] = useState<Membro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        if (vivo) { setMembro(null); setCarregando(false); }
        return;
      }
      const { data } = await supabase.from("equipe").select("id,nome,telefone,usuario,email,perfil,ativo").eq("id", u.user.id).maybeSingle();
      if (vivo) { setMembro(data && data.ativo ? (data as Membro) : null); setCarregando(false); }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") setVersao((v) => v + 1);
    });
    return () => { vivo = false; sub.subscription.unsubscribe(); };
  }, [supabase, versao]);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/entrar";
  }, [supabase]);

  const valor = useMemo<Ctx>(() => ({
    membro, carregando, sair,
    pode: (...perfis) => !!membro && perfis.includes(membro.perfil),
    recarregar: () => setVersao((v) => v + 1),
  }), [membro, carregando, sair]);
  return <C.Provider value={valor}>{children}</C.Provider>;
}

export function useSessao() {
  const c = useContext(C);
  if (!c) throw new Error("useSessao fora do SessaoProvider");
  return c;
}

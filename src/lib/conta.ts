"use client";
// Conta do cliente no site (opcional — nunca é obrigatória para pedir).
// Entra com telefone + senha; o e-mail de login é interno e criado pelo banco (criar_conta_cliente).
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "./supabase/client";

export const DOMINIO_CLIENTE = "@clientes.aconchego.app";

/** Só dígitos, com 55 na frente quando vier com DDD (10 ou 11 dígitos). */
export function telefoneCompleto(tel: string) {
  const d = tel.replace(/\D/g, "");
  return d.length === 10 || d.length === 11 ? `55${d}` : d;
}
export const emailCliente = (tel: string) => `c-${telefoneCompleto(tel)}${DOMINIO_CLIENTE}`;

export type DadosConta = { id: string; nome: string; telefone: string | null; endereco: string | null; referencia: string | null };
export type PedidoConta = { id: number; criado_em: string; tipo: string; total: number | null; itens: { nome: string; qtd: number }[] };

export function traduzirErroConta(msg: string) {
  if (/Invalid login/i.test(msg)) return "Telefone ou senha não conferem.";
  if (/rate limit|too many/i.test(msg)) return "Muitas tentativas. Espere um minuto e tente de novo.";
  return msg;
}

/** Conta logada neste aparelho (só clientes; login da equipe não conta). */
export function useConta() {
  const supabase = useMemo(() => createClient(), []);
  const [conta, setConta] = useState<DadosConta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const email = s.session?.user.email ?? "";
      if (!email.endsWith(DOMINIO_CLIENTE)) {
        if (vivo) { setConta(null); setCarregando(false); }
        return;
      }
      const { data } = await supabase.from("clientes").select("id,nome,telefone,endereco,referencia").eq("conta_id", s.session!.user.id).maybeSingle();
      if (vivo) { setConta((data as DadosConta) ?? null); setCarregando(false); }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT") setVersao((v) => v + 1); });
    return () => { vivo = false; sub.subscription.unsubscribe(); };
  }, [supabase, versao]);

  const sair = useCallback(async () => { await supabase.auth.signOut(); setVersao((v) => v + 1); }, [supabase]);
  return { conta, carregando, sair, recarregar: () => setVersao((v) => v + 1), supabase };
}

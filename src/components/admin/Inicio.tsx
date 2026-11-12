"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClipboardPaste, ToggleRight, Users } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { useSessao } from "@/lib/admin/sessao";
import { hojeEmPompeu } from "@/lib/horario";
import { createClient } from "@/lib/supabase/client";
import { Chave, Titulo } from "./ui";

export function Inicio() {
  const { membro, pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [cfg, setCfg] = useState<{ pedidos_pausados: boolean; mostrar_precos: boolean } | null>(null);
  const [almocoHoje, setAlmocoHoje] = useState<boolean | null>(null);
  const [pedidos7, setPedidos7] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("configuracoes").select("pedidos_pausados,mostrar_precos").eq("id", 1).single().then(({ data }) => setCfg(data));
    supabase.from("cardapio_almoco").select("id").eq("data", hojeEmPompeu()).eq("publicado", true).maybeSingle().then(({ data }) => setAlmocoHoje(!!data));
    if (pode("dono", "gerente")) {
      const desde = new Date(Date.now() - 7 * 864e5).toISOString();
      supabase.from("eventos").select("id", { count: "exact", head: true }).eq("tipo", "enviar_pedido").gte("criado_em", desde).then(({ count }) => setPedidos7(count ?? 0));
    }
  }, [supabase, pode]);

  async function salvar(campo: "pedidos_pausados" | "mostrar_precos", valor: boolean) {
    setCfg((c) => (c ? { ...c, [campo]: valor } : c));
    await supabase.from("configuracoes").update({ [campo]: valor, atualizado_em: new Date().toISOString() }).eq("id", 1);
    await atualizarSite(["config"]);
  }

  const atalho = "flex items-center gap-4 rounded-md border border-linha bg-creme-50 p-5 text-lg font-semibold text-ink active:bg-creme-200";
  return (
    <>
      <Titulo sub="O que você quer fazer agora?">Olá, {membro?.nome.split(" ")[0]}!</Titulo>
      <div className="space-y-3">
        {pode("dono", "gerente", "social") && (
          <Link href="/admin/almoco" className={`${atalho} ${almocoHoje === false ? "border-dourado bg-dourado/20" : ""}`}>
            <ClipboardPaste size={28} className="text-vinho-500" aria-hidden />
            <span>Colar cardápio do almoço<span className="block text-sm font-normal text-muted">{almocoHoje === null ? "…" : almocoHoje ? "O de hoje já está no site ✓" : "O de hoje ainda não foi publicado"}</span></span>
          </Link>
        )}
        {pode("dono", "gerente", "atendente") && (
          <Link href="/admin/cardapio" className={atalho}>
            <ToggleRight size={28} className="text-vinho-500" aria-hidden />
            <span>Ligar e desligar produtos<span className="block text-sm font-normal text-muted">Acabou algum item? Desligue aqui.</span></span>
          </Link>
        )}
        {pode("dono") && (
          <Link href="/admin/equipe" className={atalho}>
            <Users size={28} className="text-vinho-500" aria-hidden />
            <span>Equipe e acessos<span className="block text-sm font-normal text-muted">Cadastrar pessoas e trocar senhas</span></span>
          </Link>
        )}
      </div>

      {cfg && pode("dono", "gerente", "atendente") && (
        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Agora no site</h2>
          <Chave ligado={!cfg.pedidos_pausados} onChange={(v) => salvar("pedidos_pausados", !v)} rotulo={cfg.pedidos_pausados ? "Pedidos pausados" : "Recebendo pedidos"} descricao="Desligue quando a cozinha estiver lotada ou fechada." />
          {pode("dono", "gerente") && (
            <Chave ligado={cfg.mostrar_precos} onChange={(v) => salvar("mostrar_precos", v)} rotulo={cfg.mostrar_precos ? "Preços aparecendo no site" : "Todos os preços escondidos"} descricao="Um toque desliga (ou liga) TODOS os preços do site de uma vez. Desligado, o pedido sai como “valor a confirmar”." />
          )}
        </section>
      )}

      {pedidos7 !== null && (
        <p className="mt-8 rounded-md bg-creme-200 p-4 text-ink"><b className="text-2xl">{pedidos7}</b> pedidos enviados pelo site nos últimos 7 dias.</p>
      )}
    </>
  );
}

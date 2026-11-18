"use client";
// Tipos de marmitex (produtos da categoria "marmitex"): nome, preço normal e preço especial
// (quando o cliente escolhe um item com estrela). O preço especial fica em variacoes como { nome: "Especial", preco }.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { slugificar } from "@/lib/admin/fotos";
import type { Variacao } from "@/lib/dados";
import { AVISO_ESPECIAL_PADRAO, VARIACAO_ESPECIAL, precoEspecialDe, textoAvisoEspecial } from "@/lib/marmitex";
import { createClient } from "@/lib/supabase/client";
import { AreaTexto, Aviso, Botao, campoCls, Explica, traduzirErro } from "./ui";

type Linha = { id?: string; nome: string; preco: string; precoChurrasco: string; disponivel: boolean };

const numero = (s: string) => {
  const n = Number(s.replace(/[^\d,.-]/g, "").replace(",", "."));
  return s.trim() && Number.isFinite(n) ? n : null;
};
const texto = (n: number | null | undefined) => (n != null ? Number(n).toFixed(2).replace(".", ",") : "");

export function MarmitasAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [catId, setCatId] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState("");

  const carregar = useCallback(async () => {
    const { data: cfg } = await supabase.from("configuracoes").select("aviso_especial").eq("id", 1).single();
    setAviso(cfg?.aviso_especial || AVISO_ESPECIAL_PADRAO);
    const { data: cat } = await supabase.from("categorias").select("id").eq("slug", "marmitex").maybeSingle();
    if (!cat) return;
    setCatId(cat.id);
    const { data } = await supabase.from("produtos").select("id,nome,preco,disponivel,variacoes").eq("categoria_id", cat.id).order("ordem");
    const lidas = (data ?? []).map((p) => ({
      id: p.id as string, nome: p.nome as string, preco: texto(p.preco),
      precoChurrasco: texto(precoEspecialDe(p.variacoes as Variacao[] | null)),
      disponivel: p.disponivel as boolean,
    }));
    setLinhas(lidas.length ? lidas : [{ nome: "Marmitex", preco: "", precoChurrasco: "", disponivel: true }]);
    setRemovidos([]);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  const mudar = (i: number, campo: Partial<Linha>) => setLinhas((l) => l.map((x, j) => (j === i ? { ...x, ...campo } : x)));

  async function salvar() {
    if (!catId) return;
    setSalvando(true);
    setMsg(null);
    try {
      for (const id of removidos) {
        const { error } = await supabase.from("produtos").delete().eq("id", id);
        if (error) throw error;
      }
      for (const [i, l] of linhas.entries()) {
        if (!l.nome.trim()) continue;
        const especial = numero(l.precoChurrasco);
        const dados = {
          nome: l.nome.trim(), preco: numero(l.preco), disponivel: l.disponivel, ordem: i, atualizado_em: new Date().toISOString(),
          variacoes: especial != null ? [{ nome: VARIACAO_ESPECIAL, preco: especial }] : [],
        };
        const { error } = l.id
          ? await supabase.from("produtos").update(dados).eq("id", l.id)
          : await supabase.from("produtos").insert({ ...dados, categoria_id: catId, slug: `${slugificar(l.nome)}-${Date.now().toString(36).slice(-4)}` });
        if (error) throw error;
      }
      // Aviso dos itens com estrela (igual ao padrão = guarda vazio, para seguir o padrão do site)
      const texto = aviso.trim() === AVISO_ESPECIAL_PADRAO ? null : aviso.trim() || null;
      const { error: erroAviso } = await supabase.from("configuracoes").update({ aviso_especial: texto }).eq("id", 1);
      if (erroAviso) throw erroAviso;
      await atualizarSite(["cardapio", "config"]);
      setMsg({ tipo: "ok", txt: "Preços salvos. Já estão no site." });
      carregar();
    } catch (e) {
      setMsg({ tipo: "erro", txt: traduzirErro(e instanceof Error ? e.message : String(e)) });
    }
    setSalvando(false);
  }

  return (
    <>
      <Explica>
        Pelo site o cliente sempre pede <b>marmitex</b>. Se ele escolher um item com <Star size={14} className="inline fill-dourado text-vinho-500" aria-hidden /> <b>estrela</b> (churrasco, salmão…), o site troca sozinho para o <b>preço especial</b> e avisa o cliente.
        Deixou um preço em branco? O site mostra “a confirmar”.
      </Explica>
      <div className="space-y-3">
        {linhas.map((l, i) => (
          <div key={l.id ?? `n${i}`} className={`space-y-3 rounded-md border border-linha p-3 ${l.disponivel ? "bg-creme-50" : "bg-creme-200 opacity-70"}`}>
            <div className="flex items-end gap-2">
              <label className="block flex-1">
                <span className="text-sm font-semibold text-ink">Nome</span>
                <input className={campoCls} value={l.nome} placeholder="Ex.: Marmitex" onChange={(e) => mudar(i, { nome: e.target.value })} />
              </label>
              {linhas.length > 1 && (
                <button type="button" aria-label={`Apagar ${l.nome || "marmitex"}`} className="flex h-12 w-10 items-center justify-center text-fechado"
                  onClick={() => { if (l.id) setRemovidos((r) => [...r, l.id!]); setLinhas((x) => x.filter((_, j) => j !== i)); }}>
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Preço normal</span>
                <input inputMode="decimal" className={campoCls} value={l.preco} placeholder="R$ 0,00" onChange={(e) => mudar(i, { preco: e.target.value })} />
              </label>
              <label className="block">
                <span className="flex items-center gap-1 text-sm font-semibold text-ink"><Star size={14} className="fill-dourado text-vinho-500" aria-hidden />Preço especial</span>
                <input inputMode="decimal" className={campoCls} value={l.precoChurrasco} placeholder="R$ 0,00" onChange={(e) => mudar(i, { precoChurrasco: e.target.value })} />
              </label>
            </div>
            <label className="flex min-h-10 items-center gap-3 text-ink">
              <input type="checkbox" className="h-5 w-5 accent-aberto" checked={l.disponivel} onChange={(e) => mudar(i, { disponivel: e.target.checked })} />
              Vendendo hoje
            </label>
          </div>
        ))}
        <button type="button" onClick={() => setLinhas((l) => [...l, { nome: "", preco: "", precoChurrasco: "", disponivel: true }])}
          className="inline-flex min-h-10 items-center gap-1 font-semibold text-vinho-500"><Plus size={18} />Adicionar outro tamanho (ex.: Mini marmitex)</button>
        <div className="space-y-2 rounded-md border border-linha bg-creme-50 p-3">
          <AreaTexto rotulo="Aviso dos itens com estrela" rows={3} maxLength={300} value={aviso} onChange={(e) => setAviso(e.target.value)}
            dica="Aparece para o cliente quando o almoço do dia tem item com estrela. Escreva {preco} onde deve aparecer o preço especial." />
          <p className="text-sm text-muted"><b>Como o cliente vê:</b> {textoAvisoEspecial(aviso, numero(linhas[0]?.precoChurrasco ?? "") != null ? `R$ ${linhas[0].precoChurrasco}` : null)}</p>
          <button type="button" onClick={() => setAviso(AVISO_ESPECIAL_PADRAO)} className="text-sm text-muted underline">Voltar ao texto padrão</button>
        </div>
        {msg && <Aviso tipo={msg.tipo}>{msg.txt}</Aviso>}
        <Botao className="w-full" disabled={salvando || !catId} onClick={salvar}>{salvando ? "Salvando…" : "Salvar preços e aviso"}</Botao>
      </div>
    </>
  );
}

"use client";
// Tipos de marmitex (produtos da categoria "marmitex"): nome, preço opcional e se está à venda.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { slugificar } from "@/lib/admin/fotos";
import { createClient } from "@/lib/supabase/client";
import { Aviso, Botao, campoCls, Chave, Explica, traduzirErro } from "./ui";

type Linha = { id?: string; nome: string; descricao: string; preco: string; disponivel: boolean };

const numero = (s: string) => {
  const n = Number(s.replace(/[^\d,.-]/g, "").replace(",", "."));
  return s.trim() && Number.isFinite(n) ? n : null;
};

export function MarmitasAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [catId, setCatId] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const { data: cat } = await supabase.from("categorias").select("id").eq("slug", "marmitex").maybeSingle();
    if (!cat) return;
    setCatId(cat.id);
    const { data } = await supabase.from("produtos").select("id,nome,descricao,preco,disponivel").eq("categoria_id", cat.id).order("ordem");
    setLinhas((data ?? []).map((p) => ({ id: p.id, nome: p.nome, descricao: p.descricao ?? "", preco: p.preco != null ? String(p.preco).replace(".", ",") : "", disponivel: p.disponivel })));
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
        const dados = { nome: l.nome.trim(), descricao: l.descricao.trim() || null, preco: numero(l.preco), disponivel: l.disponivel, ordem: i, atualizado_em: new Date().toISOString() };
        const { error } = l.id
          ? await supabase.from("produtos").update(dados).eq("id", l.id)
          : await supabase.from("produtos").insert({ ...dados, categoria_id: catId, slug: `${slugificar(l.nome)}-${Date.now().toString(36).slice(-4)}`, variacoes: [] });
        if (error) throw error;
      }
      await atualizarSite(["cardapio"]);
      setMsg({ tipo: "ok", txt: "Tipos de marmitex salvos. Já estão no site." });
      carregar();
    } catch (e) {
      setMsg({ tipo: "erro", txt: traduzirErro(e instanceof Error ? e.message : String(e)) });
    }
    setSalvando(false);
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Tipos de marmitex</h2>
      <Explica>
        Cadastre aqui as marmitas que o cliente pode montar no site (ex.: Marmitex, Marmitex com churrasco, Mini marmitex, Marmitex no quilo).
        O preço é opcional: <b>com preço, ele aparece no site</b>; sem preço, aparece “a confirmar”. O cliente escolhe o tipo, marca o que quer do cardápio do dia e pode montar várias. Só aparece no horário do almoço.
      </Explica>
      <div className="mt-3 space-y-3">
        {linhas.map((l, i) => (
          <div key={l.id ?? `n${i}`} className="space-y-2 rounded-md border border-linha bg-creme-50 p-3">
            <div className="flex gap-2">
              <input aria-label="Nome da marmita" className={`${campoCls} flex-1`} value={l.nome} placeholder="Ex.: Marmitex com churrasco" onChange={(e) => mudar(i, { nome: e.target.value })} />
              <input aria-label="Preço" inputMode="decimal" className={`${campoCls} w-28`} value={l.preco} placeholder="R$ (opcional)" onChange={(e) => mudar(i, { preco: e.target.value })} />
              <button type="button" aria-label={`Remover ${l.nome || "marmita"}`} className="px-2 text-fechado"
                onClick={() => { if (l.id) setRemovidos((r) => [...r, l.id!]); setLinhas((x) => x.filter((_, j) => j !== i)); }}>
                <Trash2 size={20} />
              </button>
            </div>
            <input aria-label="Descrição" className={campoCls} value={l.descricao} placeholder="Descrição curta (opcional). Ex.: arroz, feijão, 2 carnes e salada" onChange={(e) => mudar(i, { descricao: e.target.value })} />
            <Chave ligado={l.disponivel} onChange={(v) => mudar(i, { disponivel: v })} rotulo="À venda hoje" />
          </div>
        ))}
        <button type="button" onClick={() => setLinhas((l) => [...l, { nome: "", descricao: "", preco: "", disponivel: true }])}
          className="inline-flex items-center gap-1 font-semibold text-vinho-500"><Plus size={18} />Adicionar tipo de marmitex</button>
        {msg && <Aviso tipo={msg.tipo}>{msg.txt}</Aviso>}
        <Botao className="w-full" disabled={salvando || !catId} onClick={salvar}>{salvando ? "Salvando…" : "Salvar tipos de marmitex"}</Botao>
      </div>
    </section>
  );
}

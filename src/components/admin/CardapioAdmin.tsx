"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { Sheet } from "@/components/Sheet";
import { prepararFoto, slugificar } from "@/lib/admin/fotos";
import { useSessao } from "@/lib/admin/sessao";
import type { Categoria, Produto, Variacao } from "@/lib/dados";
import { createClient } from "@/lib/supabase/client";
import { Ajuda, AreaTexto, Aviso, Botao, Campo, campoCls, Chave, Explica, Titulo, traduzirErro } from "./ui";

type Editavel = Pick<Produto, "nome" | "descricao" | "preco" | "variacoes" | "foto_url" | "destaque" | "meio_a_meio" | "disponivel" | "tags"> & { id?: string; categoria_id: string };

const real = (n: number | null | undefined) => (n == null ? "" : n.toFixed(2).replace(".", ","));
const numero = (s: string) => {
  const v = Number(s.replace(/\./g, "").replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
};

export function CardapioAdmin() {
  const { pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [prods, setProds] = useState<Produto[]>([]);
  const [aberta, setAberta] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Editavel | null>(null);
  const [mostrarPrecos, setMostrarPrecos] = useState<boolean | null>(null);
  const podeEditar = pode("dono", "gerente");

  const carregar = useCallback(async () => {
    const [c, p] = await Promise.all([
      supabase.from("categorias").select("id,nome,slug,descricao,turno,ordem").eq("ativo", true).order("ordem"),
      supabase.from("produtos").select("*").order("ordem"),
    ]);
    const { data: cfg } = await supabase.from("configuracoes").select("mostrar_precos").eq("id", 1).single();
    setMostrarPrecos(cfg?.mostrar_precos ?? null);
    setCats((c.data as Categoria[]) ?? []);
    setProds(((p.data as Produto[]) ?? []).map((x) => ({ ...x, variacoes: x.variacoes ?? [] })));
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function alternar(p: Produto) {
    setProds((x) => x.map((i) => (i.id === p.id ? { ...i, disponivel: !p.disponivel } : i)));
    await supabase.from("produtos").update({ disponivel: !p.disponivel }).eq("id", p.id);
    await atualizarSite(["cardapio"]);
  }

  const filtro = busca.trim().toLowerCase();
  return (
    <>
      <Titulo sub={podeEditar ? "Toque no interruptor para tirar um item do site na hora. Toque no lápis para editar." : "Acabou algum item? Desligue aqui que ele some do site na hora."}>Cardápio</Titulo>
      <Ajuda passos={podeEditar ? [
        <>Toque no nome de um grupo (ex.: <b>Pizzas</b>) para ver os itens.</>,
        <>O <b>interruptor verde</b> mostra o item no site. Desligado (cinza), o item aparece como <b>“Indisponível hoje”</b>.</>,
        <>Toque no <b>lápis</b> para mudar nome, descrição, preço, tamanhos ou foto. Depois toque em <b>Salvar</b>.</>,
        <>Para criar um item novo, abra o grupo e toque em <b>+ Novo item</b> no final da lista.</>,
      ] : [
        <>Toque no nome de um grupo (ex.: <b>Pizzas</b>) para ver os itens.</>,
        <>Acabou algum item? <b>Desligue o interruptor</b>. Ele aparece no site como “Indisponível hoje”.</>,
        <>Voltou a ter? Ligue de novo.</>,
      ]} dicas={podeEditar ? [
        "Só por hoje? Use o interruptor. Apagar (lixeira) tira o item para sempre.",
        "Use a busca no topo para achar um item rápido.",
        "Descrição boa vende mais: diga os ingredientes e se serve 2 pessoas.",
      ] : undefined} />
      {podeEditar && mostrarPrecos !== null && (
        <div className="mb-4">
          <Chave ligado={mostrarPrecos} rotulo={mostrarPrecos ? "Preços aparecendo no site" : "Todos os preços escondidos"} descricao="Liga ou desliga todos os preços de uma vez."
            onChange={async (v) => { setMostrarPrecos(v); await supabase.from("configuracoes").update({ mostrar_precos: v }).eq("id", 1); await atualizarSite(["config"]); }} />
        </div>
      )}
      <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto…" aria-label="Buscar produto" className={`${campoCls} mb-4`} />
      <div className="space-y-3">
        {cats.map((c) => {
          const lista = prods.filter((p) => p.categoria_id === c.id && (!filtro || p.nome.toLowerCase().includes(filtro)));
          if (filtro && lista.length === 0) return null;
          const expandida = aberta === c.id || !!filtro;
          const desligados = lista.filter((p) => !p.disponivel).length;
          return (
            <section key={c.id} className="rounded-md border border-linha bg-creme-50">
              <button type="button" onClick={() => setAberta(expandida && !filtro ? null : c.id)} aria-expanded={expandida} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                <span>
                  <span className="font-serif text-lg font-semibold">{c.nome}</span>
                  <span className="block text-sm text-muted">{lista.length} itens{desligados ? ` · ${desligados} desligado(s)` : ""} · {c.turno === "almoco" ? "almoço" : c.turno === "noite" ? "noite" : "almoço e noite"}</span>
                </span>
                <ChevronDown size={22} className={`text-muted transition ${expandida ? "rotate-180" : ""}`} />
              </button>
              {expandida && (
                <ul className="divide-y divide-linha border-t border-linha">
                  {lista.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <span className={`min-w-0 flex-1 ${p.disponivel ? "" : "text-muted line-through"}`}>{p.nome}</span>
                      {podeEditar && (
                        <button type="button" aria-label={`Editar ${p.nome}`} onClick={() => setEditando({ ...p })} className="rounded-pill p-2 text-vinho-500 hover:bg-creme-200"><Pencil size={20} /></button>
                      )}
                      <button type="button" role="switch" aria-checked={p.disponivel} aria-label={`${p.nome} ${p.disponivel ? "disponível" : "indisponível"}`} onClick={() => alternar(p)}
                        className={`relative h-8 w-14 shrink-0 rounded-pill transition ${p.disponivel ? "bg-aberto" : "bg-linha"}`}>
                        <span className={`absolute top-1 h-6 w-6 rounded-pill bg-creme-50 transition-all ${p.disponivel ? "left-7" : "left-1"}`} />
                      </button>
                    </li>
                  ))}
                  {podeEditar && (
                    <li className="p-3">
                      <button type="button" onClick={() => setEditando({ categoria_id: c.id, nome: "", descricao: "", preco: null, variacoes: [], foto_url: null, destaque: false, meio_a_meio: false, disponivel: true, tags: [] })}
                        className="inline-flex items-center gap-1 font-semibold text-vinho-500"><Plus size={18} />Novo item em {c.nome}</button>
                    </li>
                  )}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      {editando && <EditorProduto inicial={editando} categorias={cats} onFechar={() => setEditando(null)} onSalvo={() => { setEditando(null); carregar(); }} />}
    </>
  );
}

function EditorProduto({ inicial, categorias, onFechar, onSalvo }: { inicial: Editavel; categorias: Categoria[]; onFechar: () => void; onSalvo: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [p, setP] = useState<Editavel>(inicial);
  const [precoTxt, setPrecoTxt] = useState(real(inicial.preco));
  const [vars, setVars] = useState<{ nome: string; preco: string }[]>(inicial.variacoes.map((v) => ({ nome: v.nome, preco: real(v.preco) })));
  const [tagsTxt, setTagsTxt] = useState(inicial.tags.join(", "));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const set = <K extends keyof Editavel>(k: K, v: Editavel[K]) => setP((x) => ({ ...x, [k]: v }));

  async function enviarFoto(arquivo?: File) {
    if (!arquivo) return;
    setErro(null);
    try {
      const blob = await prepararFoto(arquivo, 1000, true);
      const caminho = `produtos/${slugificar(p.nome || "produto")}-${Date.now()}.webp`;
      const { error } = await supabase.storage.from("fotos").upload(caminho, blob, { contentType: "image/webp", upsert: false });
      if (error) throw error;
      set("foto_url", supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar a foto");
    }
  }

  async function salvar() {
    if (!p.nome.trim()) return setErro("Dê um nome para o produto.");
    setSalvando(true);
    setErro(null);
    const variacoes: Variacao[] = vars.filter((v) => v.nome.trim()).map((v) => ({ nome: v.nome.trim(), preco: numero(v.preco) }));
    const dados = {
      categoria_id: p.categoria_id,
      nome: p.nome.trim(),
      descricao: p.descricao?.trim() || null,
      preco: variacoes.length ? null : numero(precoTxt),
      variacoes,
      foto_url: p.foto_url,
      foto_alt: p.foto_url ? `${p.nome.trim()} – Restaurante e Pizzaria Aconchego, Pompéu – MG` : null,
      tags: tagsTxt.split(",").map((t) => t.trim()).filter(Boolean),
      destaque: p.destaque,
      meio_a_meio: p.meio_a_meio,
      disponivel: p.disponivel,
      atualizado_em: new Date().toISOString(),
    };
    const { error } = p.id
      ? await supabase.from("produtos").update(dados).eq("id", p.id)
      : await supabase.from("produtos").insert({ ...dados, slug: `${slugificar(p.nome)}-${Date.now().toString(36).slice(-4)}`, ordem: 9999 });
    setSalvando(false);
    if (error) return setErro(traduzirErro(error.message));
    await atualizarSite(["cardapio"]);
    onSalvo();
  }

  async function excluir() {
    if (!p.id || !window.confirm(`Apagar “${p.nome}” do cardápio? Isso não tem volta. Se for só por hoje, use o interruptor.`)) return;
    const { error } = await supabase.from("produtos").delete().eq("id", p.id);
    if (error) return setErro(traduzirErro(error.message));
    await atualizarSite(["cardapio"]);
    onSalvo();
  }

  return (
    <Sheet aberto titulo={p.id ? "Editar item" : "Novo item"} onFechar={onFechar}
      rodape={<div className="flex gap-3">{p.id && <Botao variante="perigo" onClick={excluir} aria-label="Apagar item"><Trash2 size={20} /></Botao>}<Botao className="flex-1" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar"}</Botao></div>}>
      <div className="space-y-5">
        <div>
          <Campo rotulo="Nome" value={p.nome} onChange={(e) => set("nome", e.target.value)} />
          <Explica>Como o cliente procura. Ex.: “Pizza Calabresa”, “Porção de Picanha”.</Explica>
        </div>
        <AreaTexto rotulo="Descrição" dica="Ingredientes ou detalhes. Opcional." rows={3} value={p.descricao ?? ""} onChange={(e) => set("descricao", e.target.value)} />

        <div>
          <span className="font-semibold">Foto <span className="font-normal text-muted">(opcional)</span></span>
          <Explica>Tire de cima ou de lado, com boa luz. A foto fica quadrada sem cortar nada, e o Google lê o nome do prato nela automaticamente.</Explica>
          <div className="mt-2 flex items-center gap-3">
            {p.foto_url ? <Image src={p.foto_url} alt="" width={96} height={96} className="h-24 w-24 rounded-md object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-md bg-creme-200 text-muted"><ImagePlus size={28} /></div>}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded-pill border border-linha px-4 py-2 text-center font-semibold">
                {p.foto_url ? "Trocar foto" : "Escolher foto"}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => enviarFoto(e.target.files?.[0])} />
              </label>
              {p.foto_url && <button type="button" onClick={() => set("foto_url", null)} className="text-sm text-fechado underline">Tirar foto</button>}
            </div>
          </div>
        </div>

        <div>
          <span className="font-semibold">Tamanhos e preços</span>
          <span className="block text-sm text-muted">Ex.: Meia / Inteira, ou Pequena / Grande. Sem tamanhos? Deixe vazio e use o preço único.</span>
          <ul className="mt-2 space-y-2">
            {vars.map((v, i) => (
              <li key={i} className="flex gap-2">
                <input value={v.nome} onChange={(e) => setVars((x) => x.map((y, j) => (j === i ? { ...y, nome: e.target.value } : y)))} placeholder="Tamanho" aria-label="Tamanho" className={`${campoCls} mt-0 flex-1`} />
                <input value={v.preco} onChange={(e) => setVars((x) => x.map((y, j) => (j === i ? { ...y, preco: e.target.value } : y)))} placeholder="R$" inputMode="decimal" aria-label="Preço" className={`${campoCls} mt-0 w-24`} />
                <button type="button" onClick={() => setVars((x) => x.filter((_, j) => j !== i))} aria-label="Remover tamanho" className="p-2 text-muted"><Trash2 size={20} /></button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setVars((x) => [...x, { nome: "", preco: "" }])} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-vinho-500"><Plus size={16} />Adicionar tamanho</button>
        </div>
        {vars.length === 0 && <Campo rotulo="Preço (R$)" dica="Opcional. Sem preço aparece “a confirmar”." inputMode="decimal" value={precoTxt} onChange={(e) => setPrecoTxt(e.target.value)} placeholder="Ex.: 35,00" />}

        <label className="block">
          <span className="font-semibold">Categoria</span>
          <select value={p.categoria_id} onChange={(e) => set("categoria_id", e.target.value)} className={campoCls}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <Campo rotulo="Etiquetas" dica="Separadas por vírgula. Ex.: Vegetariana, Serve 2" value={tagsTxt} onChange={(e) => setTagsTxt(e.target.value)} />
        <Chave ligado={p.disponivel} onChange={(v) => set("disponivel", v)} rotulo="Disponível" />
        <Chave ligado={p.destaque} onChange={(v) => set("destaque", v)} rotulo="Destaque" descricao="Aparece em “Destaques da casa” na página inicial." />
        <Chave ligado={p.meio_a_meio} onChange={(v) => set("meio_a_meio", v)} rotulo="Aceita meio a meio" descricao="Para pizzas." />
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
      </div>
    </Sheet>
  );
}

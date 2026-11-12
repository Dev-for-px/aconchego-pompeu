"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { Sheet } from "@/components/Sheet";
import { prepararFoto, slugificar } from "@/lib/admin/fotos";
import { useSessao } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { AreaTexto, Aviso, Botao, Campo, campoCls, Chave, Titulo, traduzirErro } from "./ui";

type Foto = { id: string; url: string; legenda: string | null; ordem: number; ativo: boolean };
type Post = { id?: string; titulo: string; slug?: string; resumo: string | null; conteudo: string; capa_url: string | null; publicado: boolean; publicado_em: string | null };

async function enviar(supabase: ReturnType<typeof createClient>, arquivo: File, pasta: string, nome: string) {
  const blob = await prepararFoto(arquivo, 1600);
  const caminho = `${pasta}/${slugificar(nome || "foto")}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
  const { error } = await supabase.storage.from("fotos").upload(caminho, blob, { contentType: "image/webp" });
  if (error) throw error;
  return supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

export function ConteudoAdmin() {
  const [aba, setAba] = useState<"fotos" | "posts">("fotos");
  return (
    <>
      <Titulo sub="Fotos aparecem logo abaixo da capa do site. Publicações viram páginas de Novidades (ótimo para o Google).">Fotos e publicações</Titulo>
      <div role="tablist" className="mb-6 flex rounded-pill border border-linha bg-creme-200 p-1">
        {([["fotos", "Fotos"], ["posts", "Publicações"]] as const).map(([v, t]) => (
          <button key={v} type="button" role="tab" aria-selected={aba === v} onClick={() => setAba(v)}
            className={`flex-1 rounded-pill py-2.5 font-semibold ${aba === v ? "bg-vinho-700 text-creme-50" : "text-ink"}`}>{t}</button>
        ))}
      </div>
      {aba === "fotos" ? <Fotos /> : <Publicacoes />}
    </>
  );
}

function Fotos() {
  const supabase = useMemo(() => createClient(), []);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [enviando, setEnviando] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("galeria").select("id,url,legenda,ordem,ativo").order("ordem");
    setFotos((data as Foto[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function adicionar(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setErro(null);
    setEnviando(arquivos.length);
    let ordem = (fotos.at(-1)?.ordem ?? 0) + 10;
    for (const a of Array.from(arquivos)) {
      try {
        const url = await enviar(supabase, a, "galeria", "aconchego");
        await supabase.from("galeria").insert({ url, ordem, legenda: null });
        ordem += 10;
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao enviar foto");
      }
      setEnviando((n) => n - 1);
    }
    await atualizarSite(["galeria"]);
    carregar();
  }

  async function salvar(f: Foto, mudanca: Partial<Foto>) {
    setFotos((x) => x.map((y) => (y.id === f.id ? { ...y, ...mudanca } : y)));
    await supabase.from("galeria").update(mudanca).eq("id", f.id);
    await atualizarSite(["galeria"]);
  }
  async function mover(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= fotos.length) return;
    const a = fotos[i], b = fotos[j];
    await Promise.all([supabase.from("galeria").update({ ordem: b.ordem }).eq("id", a.id), supabase.from("galeria").update({ ordem: a.ordem }).eq("id", b.id)]);
    await atualizarSite(["galeria"]);
    carregar();
  }
  async function apagar(f: Foto) {
    if (!window.confirm("Apagar esta foto do site?")) return;
    await supabase.from("galeria").delete().eq("id", f.id);
    await atualizarSite(["galeria"]);
    carregar();
  }

  return (
    <>
      <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-pill bg-vinho-700 px-5 py-3 font-semibold text-creme-50">
        <ImagePlus size={22} />{enviando ? `Enviando ${enviando}…` : "Adicionar fotos"}
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => adicionar(e.target.files)} />
      </label>
      <p className="mt-2 text-center text-sm text-muted">Pode escolher várias de uma vez. Pratos bonitos, o salão, a fachada.</p>
      {erro && <div className="mt-3"><Aviso tipo="erro">{erro}</Aviso></div>}
      <ul className="mt-6 space-y-3">
        {fotos.map((f, i) => (
          <li key={f.id} className={`flex gap-3 rounded-md border border-linha bg-creme-50 p-3 ${f.ativo ? "" : "opacity-60"}`}>
            <Image src={f.url} alt="" width={96} height={96} className="h-24 w-24 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 flex-1 space-y-2">
              <input defaultValue={f.legenda ?? ""} onBlur={(e) => e.target.value !== (f.legenda ?? "") && salvar(f, { legenda: e.target.value || null })}
                placeholder="Legenda (ex.: Pizza Aconchego)" aria-label="Legenda" className={`${campoCls} mt-0 py-2`} />
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => mover(i, -1)} aria-label="Subir" className="rounded-pill p-2 text-muted"><ArrowUp size={20} /></button>
                <button type="button" onClick={() => mover(i, 1)} aria-label="Descer" className="rounded-pill p-2 text-muted"><ArrowDown size={20} /></button>
                <button type="button" onClick={() => salvar(f, { ativo: !f.ativo })} className="ml-auto rounded-pill border border-linha px-3 py-1.5 text-sm font-semibold">{f.ativo ? "Esconder" : "Mostrar"}</button>
                <button type="button" onClick={() => apagar(f)} aria-label="Apagar foto" className="rounded-pill p-2 text-fechado"><Trash2 size={20} /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Publicacoes() {
  const supabase = useMemo(() => createClient(), []);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editando, setEditando] = useState<Post | null>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("posts").select("id,titulo,slug,resumo,conteudo,capa_url,publicado,publicado_em").order("atualizado_em", { ascending: false });
    setPosts((data as Post[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  return (
    <>
      <Botao className="w-full" onClick={() => setEditando({ titulo: "", resumo: "", conteudo: "", capa_url: null, publicado: false, publicado_em: null })}><Plus size={20} />Nova publicação</Botao>
      <p className="mt-2 text-center text-sm text-muted">Ideias: promoção da semana, prato novo, evento, horário de feriado, história de um prato.</p>
      <ul className="mt-6 space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-md border border-linha bg-creme-50 p-3">
            {p.capa_url ? <Image src={p.capa_url} alt="" width={64} height={64} className="h-16 w-16 rounded-md object-cover" /> : <div className="h-16 w-16 rounded-md bg-creme-200" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.titulo}</p>
              <p className="text-sm text-muted">{p.publicado ? "No site" : "Rascunho"}</p>
            </div>
            <button type="button" onClick={() => setEditando(p)} aria-label={`Editar ${p.titulo}`} className="rounded-pill p-2 text-vinho-500"><Pencil size={20} /></button>
          </li>
        ))}
      </ul>
      {editando && <EditorPost inicial={editando} onFechar={() => setEditando(null)} onSalvo={() => { setEditando(null); carregar(); }} />}
    </>
  );
}

function EditorPost({ inicial, onFechar, onSalvo }: { inicial: Post; onFechar: () => void; onSalvo: () => void }) {
  const { membro } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [p, setP] = useState<Post>(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const set = <K extends keyof Post>(k: K, v: Post[K]) => setP((x) => ({ ...x, [k]: v }));

  async function capa(arquivo?: File) {
    if (!arquivo) return;
    try { set("capa_url", await enviar(supabase, arquivo, "posts", p.titulo)); } catch (e) { setErro(e instanceof Error ? e.message : "Erro na foto"); }
  }

  async function salvar() {
    if (!p.titulo.trim()) return setErro("Escreva um título.");
    setSalvando(true);
    setErro(null);
    const dados = {
      titulo: p.titulo.trim(),
      resumo: p.resumo?.trim() || null,
      conteudo: p.conteudo,
      capa_url: p.capa_url,
      publicado: p.publicado,
      publicado_em: p.publicado ? p.publicado_em ?? new Date().toISOString() : p.publicado_em,
      atualizado_em: new Date().toISOString(),
    };
    const { error } = p.id
      ? await supabase.from("posts").update(dados).eq("id", p.id)
      : await supabase.from("posts").insert({ ...dados, slug: `${slugificar(p.titulo).slice(0, 70)}-${Date.now().toString(36).slice(-4)}`, autor_id: membro?.id });
    setSalvando(false);
    if (error) return setErro(traduzirErro(error.message));
    await atualizarSite(["posts"]);
    onSalvo();
  }

  async function excluir() {
    if (!p.id || !window.confirm("Apagar esta publicação? Não tem volta.")) return;
    await supabase.from("posts").delete().eq("id", p.id);
    await atualizarSite(["posts"]);
    onSalvo();
  }

  return (
    <Sheet aberto titulo={p.id ? "Editar publicação" : "Nova publicação"} onFechar={onFechar}
      rodape={<div className="flex gap-3">{p.id && <Botao variante="perigo" onClick={excluir} aria-label="Apagar"><Trash2 size={20} /></Botao>}<Botao className="flex-1" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar"}</Botao></div>}>
      <div className="space-y-5">
        <Campo rotulo="Título" value={p.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex.: Rodízio de pizza na sexta-feira" />
        <AreaTexto rotulo="Resumo" dica="Uma ou duas frases. Aparece no card e no Google." rows={2} value={p.resumo ?? ""} onChange={(e) => set("resumo", e.target.value)} />
        <AreaTexto rotulo="Texto" dica="Deixe uma linha em branco entre parágrafos. Use ## no começo da linha para subtítulo e - para lista." rows={10} value={p.conteudo} onChange={(e) => set("conteudo", e.target.value)} />
        <div>
          <span className="font-semibold">Foto de capa <span className="font-normal text-muted">(opcional)</span></span>
          <div className="mt-2 flex items-center gap-3">
            {p.capa_url ? <Image src={p.capa_url} alt="" width={160} height={90} className="aspect-video w-40 rounded-md object-cover" /> : <div className="flex aspect-video w-40 items-center justify-center rounded-md bg-creme-200 text-muted"><ImagePlus size={28} /></div>}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded-pill border border-linha px-4 py-2 text-center font-semibold">{p.capa_url ? "Trocar" : "Escolher"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => capa(e.target.files?.[0])} /></label>
              {p.capa_url && <button type="button" onClick={() => set("capa_url", null)} className="text-sm text-fechado underline">Tirar</button>}
            </div>
          </div>
        </div>
        <Chave ligado={p.publicado} onChange={(v) => set("publicado", v)} rotulo={p.publicado ? "Publicado no site" : "Rascunho (só no painel)"} />
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
      </div>
    </Sheet>
  );
}

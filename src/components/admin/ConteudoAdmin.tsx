"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { Sheet } from "@/components/Sheet";
import { prepararFoto, slugificar } from "@/lib/admin/fotos";
import { useSessao } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { Ajuda, AreaTexto, Aviso, Botao, Campo, campoCls, Explica, Titulo, traduzirErro } from "./ui";

type Turno = "almoco" | "noite" | "ambos";
type Foto = { id: string; url: string; legenda: string | null; ordem: number; ativo: boolean; turno: Turno };
const TURNOS: [Turno, string][] = [["ambos", "Almoço e noite"], ["almoco", "Só almoço"], ["noite", "Só noite"]];
type Post = { id?: string; titulo: string; slug?: string; resumo: string | null; conteudo: string; capa_url: string | null; publicado: boolean; publicado_em: string | null };

async function enviar(supabase: ReturnType<typeof createClient>, arquivo: File, pasta: string, nome: string, quadrada = false) {
  const blob = await prepararFoto(arquivo, quadrada ? 1200 : 1600, quadrada);
  const caminho = `${pasta}/${slugificar(nome || "foto")}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
  const { error } = await supabase.storage.from("fotos").upload(caminho, blob, { contentType: "image/webp" });
  if (error) throw error;
  return supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

export function ConteudoAdmin() {
  const [aba, setAba] = useState<"fotos" | "posts">("fotos");
  useEffect(() => {
    // Atalhos do Início abrem direto a aba certa (#fotos ou #novidades)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.hash === "#novidades") setAba("posts");
  }, []);
  return (
    <>
      <Titulo sub="Fotos aparecem logo abaixo da capa do site. Novidades viram páginas próprias no site (em “Novidades”), ótimas para aparecer no Google.">Fotos e novidades</Titulo>
      <div role="tablist" className="mb-6 flex rounded-pill border border-linha bg-creme-200 p-1">
        {([["fotos", "Fotos"], ["posts", "Novidades"]] as const).map(([v, t]) => (
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
  const [turnoNovo, setTurnoNovo] = useState<Turno>("ambos");

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("galeria").select("id,url,legenda,ordem,ativo,turno").order("ordem");
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
        const url = await enviar(supabase, a, "galeria", "aconchego", true);
        await supabase.from("galeria").insert({ url, ordem, legenda: null, turno: turnoNovo });
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
      <Ajuda titulo="Como subir fotos (e fazer o Google achar)" passos={[
        <>Toque em <b>Adicionar fotos</b> e escolha da galeria do celular. Pode escolher <b>várias de uma vez</b>.</>,
        <>Espere aparecer na lista. Cada foto fica quadrada <b>sem cortar nada</b>.</>,
        <><b>Escreva a legenda de cada foto</b> no campo embaixo dela. É ela que o Google lê, porque o Google não enxerga a imagem, só o texto.</>,
        <>Escolha se a foto aparece no <b>almoço</b>, na <b>noite</b> ou nos dois. Use as setas para mudar a ordem.</>,
      ]} dicas={[
        <>Fórmula da legenda: <b>o que aparece</b> + <b>Aconchego</b> + <b>Pompéu</b>. Ex.: <i>“Pizza calabresa grande do Aconchego, em Pompéu – MG”</i>.</>,
        <>Outros exemplos: <i>“Porção de picanha na chapa com fritas e mandioca – Aconchego Pompéu”</i>, <i>“Salão do Restaurante Aconchego no centro de Pompéu”</i>, <i>“Chopp gelado no Aconchego, choperia em Pompéu”</i>.</>,
        "Evite legenda vaga como “foto 1” ou “IMG_2023”: não ajuda ninguém a achar o restaurante.",
        "Prefira fotos com boa luz, de perto, com o prato bonito. Foto escura afasta o cliente.",
      ]} aberta={fotos.length === 0} />
      <fieldset className="mb-3">
        <legend className="font-semibold">Onde as fotos novas vão aparecer?</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TURNOS.map(([v, t]) => (
            <button key={v} type="button" aria-pressed={turnoNovo === v} onClick={() => setTurnoNovo(v)}
              className={`rounded-pill border px-2 py-2.5 text-sm font-semibold ${turnoNovo === v ? "border-vinho-700 bg-vinho-700 text-creme-50" : "border-linha bg-creme-50 text-ink"}`}>{t}</button>
          ))}
        </div>
        <Explica>No site, as fotos do almoço aparecem na aba Almoço (antes das bebidas) e as da noite na aba Pizzaria (depois dos destaques). Dá para trocar depois em cada foto.</Explica>
      </fieldset>
      <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-pill bg-vinho-700 px-5 py-3 font-semibold text-creme-50">
        <ImagePlus size={22} />{enviando ? `Enviando ${enviando}…` : "Adicionar fotos"}
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => adicionar(e.target.files)} />
      </label>
      <p className="mt-2 text-center text-sm text-muted">Pode escolher várias de uma vez. Todas ficam quadradas, sem cortar nada da foto.</p>
      {fotos.some((f) => !f.legenda) && <p className="mt-3 rounded-md bg-dourado/20 p-3 text-sm text-ink">⚠️ {fotos.filter((f) => !f.legenda).length} foto(s) sem legenda. Escreva o que aparece na foto + “Aconchego, Pompéu” para o Google entender.</p>}
      {erro && <div className="mt-3"><Aviso tipo="erro">{erro}</Aviso></div>}
      <ul className="mt-6 space-y-3">
        {fotos.map((f, i) => (
          <li key={f.id} className={`flex gap-3 rounded-md border border-linha bg-creme-50 p-3 ${f.ativo ? "" : "opacity-60"}`}>
            <Image src={f.url} alt="" width={96} height={96} className="h-24 w-24 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 flex-1 space-y-2">
              <input defaultValue={f.legenda ?? ""} onBlur={(e) => e.target.value !== (f.legenda ?? "") && salvar(f, { legenda: e.target.value || null })}
                placeholder="Ex.: Pizza calabresa do Aconchego, em Pompéu – MG" aria-label="Legenda da foto"
                className={`${campoCls} mt-0 py-2 ${f.legenda ? "" : "border-dourado bg-dourado/10"}`} />
              <p className="text-xs text-muted">{f.legenda ? "Legenda salva ✓ (salva sozinha ao sair do campo)" : "Escreva a legenda: o que aparece + Aconchego + Pompéu"}</p>
              <select value={f.turno} onChange={(e) => salvar(f, { turno: e.target.value as Turno })} aria-label="Onde aparece" className={`${campoCls} mt-0 py-2 text-sm`}>
                {TURNOS.map(([v, t]) => <option key={v} value={v}>Aparece: {t.toLowerCase()}</option>)}
              </select>
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
      <Ajuda titulo="Como escrever uma novidade" passos={[
        <>Toque em <b>Nova novidade</b>.</>,
        <>Escreva um <b>título</b> que diga o assunto e a cidade. Ex.: <i>“Rodízio de pizza toda sexta no Aconchego, em Pompéu”</i>.</>,
        <>Escreva um <b>resumo</b> de uma ou duas frases. Ele aparece no Google e no card do site.</>,
        <>Escreva o <b>texto</b> com calma: o que é, quando, quanto custa, como pedir. Pule uma linha entre os parágrafos.</>,
        <>Coloque uma <b>foto de capa</b> e toque em <b>Publicar no site</b>. Ainda não terminou? Toque em <b>Salvar rascunho</b> e continue depois.</>,
      ]} dicas={[
        "Onde aparece: na página “Novidades” do site (menu e rodapé) e nas 3 mais recentes da página inicial.",
        "Quanto mais novidades, melhor para o Google e para as IAs (ChatGPT, Gemini) indicarem o Aconchego. Uma por semana já ajuda muito.",
        "Ideias: promoção da semana, prato novo, jogo na TV, horário de feriado, evento, história da casa, bastidores da cozinha.",
        "Embaixo de cada campo tem um contador de caracteres: verde é o tamanho ideal para o Google.",
      ]} aberta={posts.length === 0} />
      <Botao className="w-full" onClick={() => setEditando({ titulo: "", resumo: "", conteudo: "", capa_url: null, publicado: false, publicado_em: null })}><Plus size={20} />Nova novidade</Botao>
      {posts.length === 0 && <p className="mt-4 rounded-md bg-creme-200 p-4 text-center text-muted">Nenhuma novidade ainda. Que tal começar com a promoção desta semana?</p>}
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

  async function salvar(publicar: boolean) {
    if (!p.titulo.trim()) return setErro("Escreva um título.");
    if (publicar && p.conteudo.trim().length < 80) return setErro("Escreva um pouco mais no texto antes de publicar (pelo menos 2 ou 3 frases).");
    setSalvando(true);
    setErro(null);
    const dados = {
      titulo: p.titulo.trim(),
      resumo: p.resumo?.trim() || null,
      conteudo: p.conteudo,
      capa_url: p.capa_url,
      publicado: publicar,
      publicado_em: publicar ? p.publicado_em ?? new Date().toISOString() : p.publicado_em,
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
    <Sheet aberto titulo={p.id ? "Editar novidade" : "Nova novidade"} onFechar={onFechar}
      rodape={
        <div className="space-y-2">
          <div className="flex gap-2">
            {p.id && <Botao variante="perigo" onClick={excluir} aria-label="Apagar novidade"><Trash2 size={20} /></Botao>}
            <Botao variante="secundario" className="flex-1" disabled={salvando} onClick={() => salvar(false)}>{p.publicado ? "Tirar do site" : "Salvar rascunho"}</Botao>
            <Botao variante="verde" className="flex-1" disabled={salvando} onClick={() => salvar(true)}>{salvando ? "Salvando…" : p.publicado ? "Atualizar no site" : "Publicar no site"}</Botao>
          </div>
          <p className="text-center text-xs text-muted">{p.publicado ? "Esta novidade está no site." : "Rascunho fica só aqui no painel. Publicar coloca no site na hora."}</p>
        </div>
      }>
      <div className="space-y-5">
        <div>
          <Campo rotulo="Título" value={p.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex.: Rodízio de pizza toda sexta no Aconchego, em Pompéu" />
          <Contador atual={p.titulo.length} ideal={[30, 60]} dica="O Google mostra até uns 60 caracteres." />
          <Explica>Diga o assunto e, se couber, “Aconchego” e “Pompéu”. É o que aparece em azul no Google.</Explica>
        </div>
        <div>
          <AreaTexto rotulo="Resumo" dica="Uma ou duas frases. Aparece no card e no Google." rows={2} value={p.resumo ?? ""} onChange={(e) => set("resumo", e.target.value)} />
          <Contador atual={(p.resumo ?? "").length} ideal={[70, 155]} dica="O Google mostra até uns 155 caracteres." />
        </div>
        <div>
          <AreaTexto rotulo="Texto" dica="Deixe uma linha em branco entre parágrafos. Use ## no começo da linha para subtítulo e - para lista." rows={10} value={p.conteudo} onChange={(e) => set("conteudo", e.target.value)} />
          <Contador atual={p.conteudo.length} ideal={[600, 4000]} dica="Textos a partir de 600 caracteres (uns 3 parágrafos) aparecem melhor no Google." palavras={p.conteudo.trim() ? p.conteudo.trim().split(/\s+/).length : 0} />
        </div>
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
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
      </div>
    </Sheet>
  );
}

/** Contador de caracteres com faixa ideal (verde dentro, amarelo fora). */
function Contador({ atual, ideal, dica, palavras }: { atual: number; ideal: [number, number]; dica: string; palavras?: number }) {
  const ok = atual >= ideal[0] && atual <= ideal[1];
  const cor = atual === 0 ? "text-muted" : ok ? "text-aberto" : "text-vinho-500";
  return (
    <p className={`mt-1 text-xs font-semibold ${cor}`}>
      {atual} caracteres{palavras != null ? ` · ${palavras} palavras` : ""} · ideal {ideal[0]}–{ideal[1]}. <span className="font-normal text-muted">{dica}</span>
    </p>
  );
}

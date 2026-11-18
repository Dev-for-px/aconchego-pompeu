"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { lerCardapioAlmoco } from "@/lib/admin/parserAlmoco";
import { ehEspecial } from "@/lib/marmitex";
import { useSessao } from "@/lib/admin/sessao";
import type { SecaoAlmoco } from "@/lib/dados";
import { HORARIOS_PADRAO, hojeEmPompeu, type Horarios } from "@/lib/horario";
import { createClient } from "@/lib/supabase/client";
import { MarmitasAdmin } from "./MarmitasAdmin";
import { AreaTexto, Aviso, Botao, Campo, campoCls, Explica, Titulo } from "./ui";

type Registro = { id: string; data: string; texto_original: string; itens: SecaoAlmoco[]; publicado: boolean };

const dataBr = (iso: string) => iso.split("-").reverse().join("/");
// Cardápios antigos não têm a estrela: churrasco ganha estrela pelo nome.
const comMarca = (secoes: SecaoAlmoco[]) => secoes.map((s) => ({ ...s, itens: s.itens.map((i) => ({ ...i, churrasco: ehEspecial(i, s.secao) })) }));

/** Bloco numerado da tela: um passo de cada vez. */
function Passo({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-linha bg-creme-50 p-4 md:p-6">
      <h2 className="flex items-center gap-3 text-xl font-semibold">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-vinho-700 font-sans text-base text-creme-50">{n}</span>
        {titulo}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function AlmocoAdmin() {
  const { membro } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const hoje = hojeEmPompeu();
  const [data, setData] = useState(hoje);
  const [outroDia, setOutroDia] = useState(false);
  const [texto, setTexto] = useState("");
  const [secoes, setSecoes] = useState<SecaoAlmoco[]>([]);
  const [recentes, setRecentes] = useState<Registro[]>([]);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [horarios, setHorarios] = useState<Horarios | null>(null);
  const [ate, setAte] = useState("15:30");
  const [ateSalvo, setAteSalvo] = useState(false);

  useEffect(() => {
    supabase.from("configuracoes").select("horarios").eq("id", 1).single().then(({ data: c }) => {
      const h = { ...HORARIOS_PADRAO, ...(c?.horarios ?? {}) } as Horarios;
      setHorarios(h);
      setAte(h.almoco_ate || "15:30");
    });
  }, [supabase]);

  async function salvarAte() {
    if (!horarios) return;
    const novo = { ...horarios, almoco_ate: ate };
    await supabase.from("configuracoes").update({ horarios: novo }).eq("id", 1);
    await atualizarSite(["config"]);
    setHorarios(novo);
    setAteSalvo(true);
    setTimeout(() => setAteSalvo(false), 2500);
  }

  const carregar = useCallback(async () => {
    const { data: r } = await supabase.from("cardapio_almoco").select("id,data,texto_original,itens,publicado").order("data", { ascending: false }).limit(10);
    setRecentes((r as Registro[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  // Se já existe cardápio para a data escolhida, carrega para editar.
  useEffect(() => {
    const existente = recentes.find((r) => r.data === data);
    if (existente) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTexto(existente.texto_original);
      setSecoes(comMarca(existente.itens));
    }
  }, [data, recentes]);

  function lerTexto(t: string) {
    setTexto(t);
    setSecoes(lerCardapioAlmoco(t));
  }

  const mudarItem = (s: number, i: number, campo: { nome?: string; churrasco?: boolean }) =>
    setSecoes((x) => x.map((sec, si) => (si !== s ? sec : { ...sec, itens: sec.itens.map((it, ii) => (ii === i ? { ...it, ...campo } : it)) })));
  const removerItem = (s: number, i: number) =>
    setSecoes((x) => x.map((sec, si) => (si !== s ? sec : { ...sec, itens: sec.itens.filter((_, ii) => ii !== i) })).filter((sec) => sec.itens.length));
  const adicionarItem = (s: number) =>
    setSecoes((x) => x.map((sec, si) => (si !== s ? sec : { ...sec, itens: [...sec.itens, { nome: "", preco: null, churrasco: false }] })));
  const renomearSecao = (s: number, nome: string) => setSecoes((x) => x.map((sec, si) => (si === s ? { ...sec, secao: nome } : sec)));

  async function publicar(publicado: boolean) {
    setMsg(null);
    const itens = secoes.map((s) => ({ ...s, itens: s.itens.filter((i) => i.nome.trim()) })).filter((s) => s.itens.length);
    if (publicado && itens.length === 0) {
      setMsg({ tipo: "erro", txt: "Cole o texto do cardápio primeiro." });
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from("cardapio_almoco").upsert(
      { data, texto_original: texto, itens, publicado, publicado_por: membro?.id, atualizado_em: new Date().toISOString() },
      { onConflict: "data" },
    );
    setSalvando(false);
    if (error) return setMsg({ tipo: "erro", txt: error.message });
    await atualizarSite(["almoco"]);
    setMsg({ tipo: "ok", txt: publicado ? `Pronto! O almoço de ${dataBr(data)} já está no site.` : "Cardápio tirado do site." });
    carregar();
  }

  const doDia = recentes.find((r) => r.data === data);
  const outros = recentes.filter((r) => r.data !== data);
  return (
    <>
      <Titulo sub="Duas coisas: o cardápio do dia e os preços do marmitex.">Almoço</Titulo>

      <div className="space-y-6">
        <Passo n={1} titulo={data === hoje ? "Cardápio de hoje" : `Cardápio de ${dataBr(data)}`}>
          {doDia?.publicado && <p className="rounded-md bg-aberto/15 px-3 py-2 text-sm font-semibold text-aberto">✓ Já está no site. Para mudar, edite abaixo e publique de novo.</p>}
          <AreaTexto rotulo="Cole aqui o cardápio que chegou no WhatsApp" dica="No WhatsApp: segure o dedo na mensagem › Copiar. Aqui: segure o dedo no campo › Colar." rows={7} value={texto} onChange={(e) => lerTexto(e.target.value)} placeholder={"Churrasco\nFrango assado\nArroz\nFeijão tropeiro\nSalada"} />

          {secoes.length > 0 && (
            <div>
              <p className="font-semibold text-ink">Confira como vai ficar</p>
              <Explica>Toque num item para corrigir. A <Star size={14} className="inline fill-dourado text-vinho-500" aria-hidden /> <b>estrela acesa</b> marca item especial (churrasco, salmão, picanha…): se o cliente escolher esse item, o marmitex dele passa para o <b>preço especial</b>. Toque na estrela para ligar ou desligar.</Explica>
              <div className="mt-3 space-y-4">
                {secoes.map((s, si) => (
                  <div key={si}>
                    {(secoes.length > 1 || s.secao !== "Cardápio do dia") && (
                      <input value={s.secao} onChange={(e) => renomearSecao(si, e.target.value)} aria-label="Nome do grupo" className="w-full bg-transparent font-serif text-lg font-semibold text-ink outline-none" />
                    )}
                    <ul className="mt-1 space-y-2">
                      {s.itens.map((it, ii) => (
                        <li key={ii} className="flex items-center gap-1">
                          <input value={it.nome} onChange={(e) => mudarItem(si, ii, { nome: e.target.value })} aria-label="Item" className={`${campoCls} mt-0 py-2`} />
                          <button type="button" role="switch" aria-checked={!!it.churrasco} aria-label={`${it.nome || "Item"} é especial (estrela)`} title="Item especial? (marmitex fica mais caro)" onClick={() => mudarItem(si, ii, { churrasco: !it.churrasco })}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border ${it.churrasco ? "border-vinho-700 bg-vinho-700 text-creme-50" : "border-linha bg-creme-50 text-linha"}`}>
                            <Star size={20} className={it.churrasco ? "fill-dourado" : ""} />
                          </button>
                          <button type="button" onClick={() => removerItem(si, ii)} aria-label={`Remover ${it.nome || "item"}`} className="flex h-11 w-9 shrink-0 items-center justify-center text-muted"><Trash2 size={20} /></button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => adicionarItem(si)} className="mt-2 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-vinho-500"><Plus size={16} />Adicionar item</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {msg && <Aviso tipo={msg.tipo}>{msg.txt}</Aviso>}
          <Botao variante="verde" className="w-full" disabled={salvando} onClick={() => publicar(true)}>
            {salvando ? "Publicando…" : data === hoje ? "Publicar cardápio de hoje" : `Publicar para ${dataBr(data)}`}
          </Botao>
          {doDia?.publicado && <Botao variante="secundario" className="w-full" disabled={salvando} onClick={() => publicar(false)}>Tirar do site</Botao>}
        </Passo>

        <Passo n={2} titulo="Preços do marmitex">
          <MarmitasAdmin />
        </Passo>

        <details className="group rounded-md border border-linha bg-creme-200">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold text-ink">
            Mais opções
            <span aria-hidden className="text-xl text-vinho-500 transition group-open:rotate-45">+</span>
          </summary>
          <div className="space-y-6 px-4 pb-4">
            <div>
              <p className="font-semibold text-ink">Deixar pronto o cardápio de outro dia</p>
              <Explica>Escolha o dia, volte lá em cima, cole o cardápio e publique. Ele só aparece no site no dia certo.</Explica>
              {outroDia || data !== hoje
                ? <div className="mt-2 flex items-end gap-3">
                    <div className="flex-1"><Campo rotulo="Para qual dia?" type="date" value={data} onChange={(e) => setData(e.target.value || hoje)} /></div>
                    {data !== hoje && <Botao variante="secundario" onClick={() => { setData(hoje); setOutroDia(false); }}>Voltar para hoje</Botao>}
                  </div>
                : <Botao variante="secundario" className="mt-2" onClick={() => setOutroDia(true)}>Escolher outro dia</Botao>}
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1"><Campo rotulo="O almoço sai do site todo dia às" dica="Depois desse horário o site avisa que o almoço de hoje já encerrou." type="time" value={ate} onChange={(e) => setAte(e.target.value)} /></div>
              <Botao variante="secundario" onClick={salvarAte} disabled={!horarios || ate === horarios?.almoco_ate}>{ateSalvo ? "Salvo ✓" : "Salvar"}</Botao>
            </div>

            {outros.length > 0 && (
              <div>
                <p className="font-semibold text-ink">Usar o cardápio de outro dia</p>
                <Explica>Cardápio parecido? Toque em “Usar este” e só ajuste o que mudou.</Explica>
                <ul className="mt-2 divide-y divide-linha rounded-md border border-linha bg-creme-50">
                  {outros.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                      <span>
                        <b>{dataBr(r.data)}</b>
                        <span className="block text-sm text-muted">{r.itens.flatMap((s) => s.itens.map((i) => i.nome)).slice(0, 4).join(", ")}…</span>
                      </span>
                      <button type="button" onClick={() => { setTexto(r.texto_original); setSecoes(comMarca(r.itens)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="min-h-10 shrink-0 rounded-pill border border-linha px-4 py-2 text-sm font-semibold">Usar este</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-muted">Dica: para separar em grupos (Carnes, Acompanhamentos…), escreva o nome do grupo com dois pontos no fim (“Carnes:”) ou entre *asteriscos*.</p>
          </div>
        </details>
      </div>
    </>
  );
}

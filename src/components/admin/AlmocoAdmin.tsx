"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { lerCardapioAlmoco } from "@/lib/admin/parserAlmoco";
import { useSessao } from "@/lib/admin/sessao";
import type { SecaoAlmoco } from "@/lib/dados";
import { HORARIOS_PADRAO, hojeEmPompeu, type Horarios } from "@/lib/horario";
import { createClient } from "@/lib/supabase/client";
import { Ajuda, AreaTexto, Aviso, Botao, Campo, campoCls, Titulo } from "./ui";

type Registro = { id: string; data: string; texto_original: string; itens: SecaoAlmoco[]; publicado: boolean };

const dataBr = (iso: string) => iso.split("-").reverse().join("/");

export function AlmocoAdmin() {
  const { membro } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState(hojeEmPompeu());
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
      setSecoes(existente.itens);
    }
  }, [data, recentes]);

  function lerTexto(t: string) {
    setTexto(t);
    setSecoes(lerCardapioAlmoco(t));
  }

  const editarItem = (s: number, i: number, nome: string) =>
    setSecoes((x) => x.map((sec, si) => (si !== s ? sec : { ...sec, itens: sec.itens.map((it, ii) => (ii === i ? { ...it, nome } : it)) })));
  const removerItem = (s: number, i: number) =>
    setSecoes((x) => x.map((sec, si) => (si !== s ? sec : { ...sec, itens: sec.itens.filter((_, ii) => ii !== i) })).filter((sec) => sec.itens.length));
  const adicionarItem = (s: number) =>
    setSecoes((x) => x.map((sec, si) => (si !== s ? sec : { ...sec, itens: [...sec.itens, { nome: "", preco: null }] })));
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

  const hoje = hojeEmPompeu();
  const doDia = recentes.find((r) => r.data === data);
  return (
    <>
      <Titulo sub="Cole o texto que chegou no WhatsApp. O site monta o cardápio sozinho e ele só vale para a data escolhida.">Cardápio do almoço</Titulo>
      <Ajuda passos={[
        <>No WhatsApp, <b>segure o dedo</b> em cima da mensagem do cardápio e toque em <b>Copiar</b>.</>,
        <>Volte aqui, toque no campo <b>“Cole aqui o cardápio”</b>, segure o dedo e toque em <b>Colar</b>.</>,
        <>Embaixo aparece <b>como vai ficar no site</b>. Se algo saiu errado, toque no item e corrija, ou apague na lixeira.</>,
        <>Toque no botão verde <b>Publicar cardápio de hoje</b>. Pronto, já está no site!</>,
      ]} dicas={[
        <>Para separar em grupos (Carnes, Acompanhamentos…), escreva o nome do grupo em <b>*asteriscos*</b> ou com dois pontos no fim: “Carnes:”.</>,
        <>Quer deixar o de amanhã pronto? Troque a <b>data</b> antes de publicar.</>,
        <>O cardápio sai do site sozinho no horário de <b>“Sai do site todo dia às”</b>.</>,
        <>Cardápio parecido com o de outro dia? Use <b>Reaproveitar</b> lá embaixo e só ajuste.</>,
      ]} />

      <div className="space-y-5">
        <Campo rotulo="Para qual dia?" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        <div className="rounded-md border border-linha bg-creme-200 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1"><Campo rotulo="Sai do site todo dia às" dica="Vale para todos os dias. Depois desse horário o site mostra “o almoço de hoje já encerrou”." type="time" value={ate} onChange={(e) => setAte(e.target.value)} /></div>
            <Botao variante="secundario" onClick={salvarAte} disabled={!horarios || ate === horarios?.almoco_ate}>{ateSalvo ? "Salvo ✓" : "Salvar"}</Botao>
          </div>
        </div>
        <AreaTexto rotulo="Cole aqui o cardápio" rows={9} value={texto} onChange={(e) => lerTexto(e.target.value)} placeholder={"*CARNES*\nFrango assado\nCostela\n\n*ACOMPANHAMENTOS*\nArroz\nFeijão tropeiro"} />
      </div>

      {secoes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Confira como vai ficar</h2>
          <p className="text-sm text-muted">Pode corrigir qualquer item tocando nele.</p>
          <div className="mt-3 space-y-4">
            {secoes.map((s, si) => (
              <div key={si} className="rounded-md border border-linha bg-creme-50 p-4">
                <input value={s.secao} onChange={(e) => renomearSecao(si, e.target.value)} aria-label="Nome da seção" className="w-full bg-transparent font-serif text-lg font-semibold text-ink outline-none" />
                <ul className="mt-2 space-y-2">
                  {s.itens.map((it, ii) => (
                    <li key={ii} className="flex items-center gap-2">
                      <input value={it.nome} onChange={(e) => editarItem(si, ii, e.target.value)} aria-label="Item" className={`${campoCls} mt-0 py-2`} />
                      {it.preco != null && <span className="shrink-0 text-sm font-semibold text-vinho-500">R$ {it.preco.toFixed(2).replace(".", ",")}</span>}
                      <button type="button" onClick={() => removerItem(si, ii)} aria-label="Remover item" className="shrink-0 p-2 text-muted"><Trash2 size={20} /></button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => adicionarItem(si)} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-vinho-500"><Plus size={16} />Adicionar item</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 space-y-3">
        {msg && <Aviso tipo={msg.tipo}>{msg.txt}</Aviso>}
        <Botao variante="verde" className="w-full" disabled={salvando} onClick={() => publicar(true)}>
          {salvando ? "Publicando…" : data === hoje ? "Publicar cardápio de hoje" : `Publicar para ${dataBr(data)}`}
        </Botao>
        {doDia?.publicado && <Botao variante="secundario" className="w-full" disabled={salvando} onClick={() => publicar(false)}>Tirar do site</Botao>}
      </div>

      {recentes.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Últimos cardápios</h2>
          <p className="text-sm text-muted">Toque em “Reaproveitar” para usar um cardápio antigo como base.</p>
          <ul className="mt-3 divide-y divide-linha rounded-md border border-linha bg-creme-50">
            {recentes.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                <span>
                  <b>{dataBr(r.data)}</b>{r.data === hoje && " (hoje)"}
                  <span className="block text-sm text-muted">{r.publicado ? "No site" : "Rascunho"} · {r.itens.reduce((n, s) => n + s.itens.length, 0)} itens</span>
                </span>
                <button type="button" onClick={() => { setTexto(r.texto_original); setSecoes(r.itens); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-pill border border-linha px-4 py-2 text-sm font-semibold">Reaproveitar</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

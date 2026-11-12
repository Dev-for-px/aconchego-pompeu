"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { useSessao } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { SAIDA_PADRAO, type Saida } from "@/lib/saida";
import { REDES, type Redes } from "@/lib/redes";
import { AreaTexto, Aviso, Botao, Campo, Chave, Titulo, traduzirErro } from "./ui";

type Faq = { id?: string; pergunta: string; resposta: string; ordem: number; ativo: boolean };
const real = (n: number | null) => (n == null ? "" : n.toFixed(2).replace(".", ","));
const numero = (s: string) => {
  const v = Number(s.replace(/\./g, "").replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
};

export function AjustesAdmin() {
  const { pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [f, setF] = useState({ whatsapp: "", telefone: "", taxa: "", minimo: "", historia: "", aiqfome: "", mostrar_precos: true, pedidos_pausados: false });
  const [faq, setFaq] = useState<Faq[]>([]);
  const [redes, setRedes] = useState<Redes>({});
  const [saida, setSaida] = useState<Saida>(SAIDA_PADRAO);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const [{ data: c }, { data: q }] = await Promise.all([
      supabase.from("configuracoes").select("*").eq("id", 1).single(),
      supabase.from("faq").select("id,pergunta,resposta,ordem,ativo").order("ordem"),
    ]);
    if (c) { setRedes(c.redes ?? {}); setSaida({ ...SAIDA_PADRAO, ...(c.saida ?? {}) }); }
    if (c) setF({ whatsapp: c.whatsapp, telefone: c.telefone, taxa: real(c.taxa_entrega), minimo: real(c.pedido_minimo), historia: c.historia ?? "", aiqfome: c.redes?.aiqfome ?? "", mostrar_precos: c.mostrar_precos, pedidos_pausados: c.pedidos_pausados });
    setFaq((q as Faq[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  if (!pode("dono", "gerente")) return <p className="text-muted">Sem acesso a esta página.</p>;

  async function salvar() {
    setSalvando(true);
    setMsg(null);
    const { error } = await supabase.from("configuracoes").update({
      whatsapp: f.whatsapp.replace(/\D/g, "").replace(/^(?!55)/, "55"),
      telefone: f.telefone.replace(/\D/g, "").replace(/^(?!55)/, "55"),
      taxa_entrega: numero(f.taxa),
      pedido_minimo: numero(f.minimo),
      historia: f.historia.trim() || null,
      redes: Object.fromEntries(Object.entries({ ...redes, aiqfome: f.aiqfome }).map(([k, v]) => [k, (v ?? "").trim()]).filter(([, v]) => v)),
      saida,
      mostrar_precos: f.mostrar_precos,
      pedidos_pausados: f.pedidos_pausados,
      atualizado_em: new Date().toISOString(),
    }).eq("id", 1);
    if (error) { setSalvando(false); return setMsg({ tipo: "erro", txt: traduzirErro(error.message) }); }

    for (const [i, q] of faq.entries()) {
      if (!q.pergunta.trim()) continue;
      const linha = { pergunta: q.pergunta.trim(), resposta: q.resposta.trim(), ordem: (i + 1) * 10, ativo: q.ativo };
      const r = q.id ? await supabase.from("faq").update(linha).eq("id", q.id) : await supabase.from("faq").insert(linha);
      if (r.error) { setSalvando(false); return setMsg({ tipo: "erro", txt: traduzirErro(r.error.message) }); }
    }
    await atualizarSite(["config", "faq"]);
    setSalvando(false);
    setMsg({ tipo: "ok", txt: "Tudo salvo e já atualizado no site." });
    carregar();
  }

  async function apagarFaq(i: number) {
    const q = faq[i];
    if (q.id && !window.confirm("Apagar esta pergunta?")) return;
    if (q.id) await supabase.from("faq").delete().eq("id", q.id);
    setFaq((x) => x.filter((_, j) => j !== i));
    await atualizarSite(["faq"]);
  }

  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      <Titulo sub="Informações que aparecem no site e no pedido.">Ajustes</Titulo>
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pedidos e entrega</h2>
          <Chave ligado={!f.pedidos_pausados} onChange={(v) => set("pedidos_pausados", !v)} rotulo={f.pedidos_pausados ? "Pedidos pausados" : "Recebendo pedidos"} />
          <Chave ligado={f.mostrar_precos} onChange={(v) => set("mostrar_precos", v)} rotulo={f.mostrar_precos ? "Preços aparecendo no site" : "Todos os preços escondidos"} descricao="Liga ou desliga todos os preços de uma vez." />
          <Campo rotulo="Taxa de entrega (R$)" dica="Aparece no pedido como “a partir de”. Deixe vazio se for combinar no WhatsApp." inputMode="decimal" value={f.taxa} onChange={(e) => set("taxa", e.target.value)} placeholder="4,00" />
          <Campo rotulo="Pedido mínimo para entrega (R$)" dica="Opcional." inputMode="decimal" value={f.minimo} onChange={(e) => set("minimo", e.target.value)} />
          <Campo rotulo="WhatsApp que recebe os pedidos" inputMode="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          <Campo rotulo="Telefone fixo" inputMode="tel" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} />
          <Campo rotulo="Link do Aiqfome" value={f.aiqfome} onChange={(e) => set("aiqfome", e.target.value)} placeholder="https://aiqfome.com/…" />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Redes sociais</h2>
          <p className="text-sm text-muted">Cole o link completo (começando com https://). Só aparecem no rodapé as que tiverem link.</p>
          {REDES.filter((r) => r.chave !== "aiqfome").map((r) => (
            <Campo key={r.chave} rotulo={r.nome} value={redes[r.chave] ?? ""} onChange={(e) => setRedes((x) => ({ ...x, [r.chave]: e.target.value }))} placeholder="https://…" inputMode="url" autoCapitalize="none" />
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Aviso “Já vai?”</h2>
          <p className="text-sm text-muted">Aparece uma vez por visita quando a pessoa está saindo do site, chamando para pedir.</p>
          <Chave ligado={saida.ativo} onChange={(v) => setSaida((x) => ({ ...x, ativo: v }))} rotulo={saida.ativo ? "Aviso ligado" : "Aviso desligado"} />
          <Campo rotulo="Título" value={saida.titulo} onChange={(e) => setSaida((x) => ({ ...x, titulo: e.target.value }))} />
          <AreaTexto rotulo="Texto" rows={2} value={saida.texto} onChange={(e) => setSaida((x) => ({ ...x, texto: e.target.value }))} />
          <label className="block">
            <span className="font-semibold">O botão leva para</span>
            <select value={saida.botao} onChange={(e) => setSaida((x) => ({ ...x, botao: e.target.value as Saida["botao"] }))} className="mt-1 w-full rounded-md border border-linha bg-creme-50 p-3 text-base">
              <option value="whatsapp">WhatsApp</option>
              <option value="ligar">Ligação</option>
              <option value="cardapio">Cardápio do site</option>
            </select>
          </label>
          <Campo rotulo="Texto do botão" value={saida.textoBotao} onChange={(e) => setSaida((x) => ({ ...x, textoBotao: e.target.value }))} />
        </section>

        <section>
          <h2 className="text-xl font-semibold">Nossa história</h2>
          <AreaTexto rotulo="Texto da página Sobre" rows={5} value={f.historia} onChange={(e) => set("historia", e.target.value)} />
        </section>

        <section>
          <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
          <p className="text-sm text-muted">Ajudam o Google e o ChatGPT a responder sobre o Aconchego. Escreva como o cliente pergunta.</p>
          <ul className="mt-3 space-y-3">
            {faq.map((q, i) => (
              <li key={q.id ?? `novo-${i}`} className="space-y-2 rounded-md border border-linha bg-creme-50 p-3">
                <Campo rotulo="Pergunta" value={q.pergunta} onChange={(e) => setFaq((x) => x.map((y, j) => (j === i ? { ...y, pergunta: e.target.value } : y)))} />
                <AreaTexto rotulo="Resposta" rows={2} value={q.resposta} onChange={(e) => setFaq((x) => x.map((y, j) => (j === i ? { ...y, resposta: e.target.value } : y)))} />
                <button type="button" onClick={() => apagarFaq(i)} className="inline-flex items-center gap-1 text-sm text-fechado"><Trash2 size={16} />Apagar</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setFaq((x) => [...x, { pergunta: "", resposta: "", ordem: 999, ativo: true }])} className="mt-3 inline-flex items-center gap-1 font-semibold text-vinho-500"><Plus size={18} />Nova pergunta</button>
        </section>
      </div>

      <div className="sticky bottom-20 mt-8 space-y-3 md:bottom-4">
        {msg && <Aviso tipo={msg.tipo}>{msg.txt}</Aviso>}
        <Botao className="w-full" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar ajustes"}</Botao>
      </div>
    </>
  );
}

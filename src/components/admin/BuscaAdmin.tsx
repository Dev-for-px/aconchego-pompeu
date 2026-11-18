"use client";
// Busca inteligente do painel: acha telas, ajustes, produtos, clientes, perguntas, novidades e pessoas da equipe.
// Abre no ícone de lupa do topo ou com Ctrl+K / ⌘K / "/". Sem acento e em qualquer ordem ("pizza calab" acha "Pizza Calabresa").
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { BarChart3, Contact, FileText, HelpCircle, Images, Search, Settings, Sun, UserRound, Users, UtensilsCrossed, X } from "lucide-react";
import { useSessao, type Perfil } from "@/lib/admin/sessao";
import { combina } from "@/lib/admin/texto";
import { createClient } from "@/lib/supabase/client";
import { formatarTelefone } from "@/lib/site";

type Resultado = { titulo: string; sub?: string; href: string; grupo: string; Icone: ElementType; palavras?: string };
type Atalho = Resultado & { perfis: Perfil[] };

const ATALHOS: Atalho[] = [
  { grupo: "Telas", titulo: "Almoço de hoje", sub: "Colar o cardápio do dia", href: "/admin/almoco", Icone: Sun, perfis: ["dono", "gerente", "social"], palavras: "cardapio do dia publicar whatsapp colar marmita" },
  { grupo: "Telas", titulo: "Preços do marmitex", sub: "Preço normal e preço especial (estrela)", href: "/admin/almoco", Icone: Sun, perfis: ["dono", "gerente", "social"], palavras: "marmitex marmita estrela especial churrasco salmao valor" },
  { grupo: "Telas", titulo: "Cardápio", sub: "Produtos, preços, fotos, ligar/desligar item", href: "/admin/cardapio", Icone: UtensilsCrossed, perfis: ["dono", "gerente", "atendente"], palavras: "produto pizza preco esgotado acabou disponivel foto" },
  { grupo: "Telas", titulo: "Fotos e novidades", sub: "Galeria e publicações", href: "/admin/conteudo", Icone: Images, perfis: ["dono", "gerente", "social"], palavras: "galeria imagem post blog publicacao" },
  { grupo: "Telas", titulo: "Clientes", sub: "Quem pediu pelo site", href: "/admin/clientes", Icone: Contact, perfis: ["dono", "gerente"], palavras: "cliente telefone endereco planilha exportar conta cadastro" },
  { grupo: "Telas", titulo: "Resultados", sub: "Visitas, pedidos e cliques", href: "/admin/resultados", Icone: BarChart3, perfis: ["dono", "gerente"], palavras: "metricas relatorio visitas acessos graficos numeros" },
  { grupo: "Telas", titulo: "Equipe e acessos", sub: "Cadastrar, remover, trocar senha", href: "/admin/equipe", Icone: Users, perfis: ["dono"], palavras: "funcionario usuario senha acesso login remover" },
  { grupo: "Ajustes", titulo: "Pausar pedidos", sub: "Ajustes › Pedidos e entrega", href: "/admin/ajustes#pedidos", Icone: Settings, perfis: ["dono", "gerente"], palavras: "pausar fechar parar pedidos" },
  { grupo: "Ajustes", titulo: "Taxa de entrega", sub: "Ajustes › Pedidos e entrega", href: "/admin/ajustes#pedidos", Icone: Settings, perfis: ["dono", "gerente"], palavras: "frete delivery entrega minimo" },
  { grupo: "Ajustes", titulo: "Esconder preços", sub: "Ajustes › Pedidos e entrega", href: "/admin/ajustes#pedidos", Icone: Settings, perfis: ["dono", "gerente"], palavras: "mostrar precos valores" },
  { grupo: "Ajustes", titulo: "WhatsApp e telefone", sub: "Ajustes › Pedidos e entrega", href: "/admin/ajustes#pedidos", Icone: Settings, perfis: ["dono", "gerente"], palavras: "numero contato aiqfome" },
  { grupo: "Ajustes", titulo: "Horário de funcionamento", sub: "Ajustes › Horários", href: "/admin/ajustes#horarios", Icone: Settings, perfis: ["dono", "gerente"], palavras: "abre fecha feriado dias horario" },
  { grupo: "Ajustes", titulo: "Menu do site", sub: "Ajustes › Menu do site", href: "/admin/ajustes#menu", Icone: Settings, perfis: ["dono", "gerente"], palavras: "links topo navegacao inicio bebidas" },
  { grupo: "Ajustes", titulo: "Redes sociais", sub: "Ajustes › Redes sociais", href: "/admin/ajustes#redes", Icone: Settings, perfis: ["dono", "gerente"], palavras: "instagram facebook tiktok" },
  { grupo: "Ajustes", titulo: "Aviso “Já vai?”", sub: "Ajustes › Aviso de saída", href: "/admin/ajustes#saida", Icone: Settings, perfis: ["dono", "gerente"], palavras: "popup pop-up saida sair voltar" },
  { grupo: "Ajustes", titulo: "Nossa história", sub: "Ajustes › Página Sobre", href: "/admin/ajustes#historia", Icone: Settings, perfis: ["dono", "gerente"], palavras: "sobre texto historia" },
  { grupo: "Ajustes", titulo: "Perguntas frequentes", sub: "Ajustes › Perguntas", href: "/admin/ajustes#faq", Icone: HelpCircle, perfis: ["dono", "gerente"], palavras: "faq duvidas seo google" },
];

export function BuscaAdmin() {
  const { membro, pode } = useSessao();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [dados, setDados] = useState<Resultado[] | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  // Atalho de teclado
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const digitando = /input|textarea|select/i.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !digitando)) { e.preventDefault(); setAberto(true); }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  // Carrega produtos, clientes, perguntas, novidades e equipe na 1ª vez que abrir (só o que o perfil pode ver).
  useEffect(() => {
    if (!aberto || dados) return;
    setTimeout(() => campo.current?.focus(), 30);
    (async () => {
      const r: Resultado[] = [];
      const pedidos: PromiseLike<void>[] = [];
      if (pode("dono", "gerente", "atendente")) pedidos.push(supabase.from("produtos").select("nome,descricao,categorias(nome)").limit(1000).then(({ data }) => {
        for (const p of (data ?? []) as unknown as { nome: string; descricao: string | null; categorias: { nome: string } | null }[])
          r.push({ grupo: "Cardápio", titulo: p.nome, sub: p.categorias?.nome, href: `/admin/cardapio?q=${encodeURIComponent(p.nome)}`, Icone: UtensilsCrossed, palavras: p.descricao ?? "" });
      }));
      if (pode("dono", "gerente")) pedidos.push(supabase.from("clientes").select("nome,telefone,endereco").order("ultimo_pedido_em", { ascending: false, nullsFirst: false }).limit(2000).then(({ data }) => {
        for (const c of (data ?? []) as { nome: string; telefone: string | null; endereco: string | null }[])
          r.push({ grupo: "Clientes", titulo: c.nome, sub: [c.telefone && formatarTelefone(c.telefone), c.endereco].filter(Boolean).join(" · "), href: `/admin/clientes?q=${encodeURIComponent(c.telefone ?? c.nome)}`, Icone: Contact, palavras: `${c.telefone ?? ""} ${c.endereco ?? ""}` });
      }));
      if (pode("dono", "gerente")) pedidos.push(supabase.from("faq").select("pergunta,resposta").then(({ data }) => {
        for (const f of (data ?? []) as { pergunta: string; resposta: string }[])
          r.push({ grupo: "Perguntas frequentes", titulo: f.pergunta, href: "/admin/ajustes#faq", Icone: HelpCircle, palavras: f.resposta });
      }));
      if (pode("dono", "gerente", "social")) pedidos.push(supabase.from("posts").select("titulo,resumo").limit(300).then(({ data }) => {
        for (const p of (data ?? []) as { titulo: string; resumo: string | null }[])
          r.push({ grupo: "Novidades", titulo: p.titulo, sub: "Fotos e novidades", href: "/admin/conteudo#novidades", Icone: FileText, palavras: p.resumo ?? "" });
      }));
      if (pode("dono")) pedidos.push(supabase.from("equipe").select("nome,usuario,telefone").then(({ data }) => {
        for (const m of (data ?? []) as { nome: string; usuario: string | null; telefone: string | null }[])
          r.push({ grupo: "Equipe", titulo: m.nome, sub: m.usuario ? `@${m.usuario}` : undefined, href: "/admin/equipe", Icone: UserRound, palavras: `${m.usuario ?? ""} ${m.telefone ?? ""}` });
      }));
      await Promise.all(pedidos);
      setDados(r);
    })();
  }, [aberto, dados, pode, supabase]);

  const resultados = useMemo(() => {
    if (!membro) return [];
    const atalhos = ATALHOS.filter((a) => a.perfis.includes(membro.perfil));
    if (!q.trim()) return atalhos.filter((a) => a.grupo === "Telas");
    const achados = [...atalhos, ...(dados ?? [])].filter((r) => combina(q, r.titulo, r.sub, r.palavras, r.grupo));
    // Título que começa com a busca vem primeiro
    return achados.sort((a, b) => Number(combina(q, b.titulo)) - Number(combina(q, a.titulo))).slice(0, 40);
  }, [q, dados, membro]);

  function ir(r: Resultado) {
    setAberto(false);
    setQ("");
    // Mesma página com ?q ou #: recarrega o estado da tela de destino
    if (window.location.pathname === r.href.split(/[?#]/)[0]) window.location.assign(r.href);
    else router.push(r.href);
  }

  if (!membro) return null;
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} aria-label="Buscar no painel" title="Buscar (Ctrl+K)" className="rounded-pill p-2 hover:bg-vinho-800"><Search size={20} /></button>
      {aberto && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/50 p-0 md:p-4 md:pt-[10vh]" role="dialog" aria-modal="true" aria-label="Buscar no painel" onClick={() => setAberto(false)}>
          <div className="flex h-dvh w-full flex-col bg-creme-50 text-ink md:h-auto md:max-h-[75vh] md:max-w-xl md:rounded-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-linha px-3 py-2">
              <Search size={20} className="shrink-0 text-muted" aria-hidden />
              <input ref={campo} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} placeholder="Buscar produto, cliente, ajuste…" aria-label="O que você procura?"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setAberto(false);
                  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, resultados.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
                  if (e.key === "Enter" && resultados[sel]) ir(resultados[sel]);
                }}
                className="min-h-12 flex-1 bg-transparent text-base outline-none" />
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar busca" className="rounded-pill p-2 text-muted"><X size={20} /></button>
            </div>
            <ul className="flex-1 overflow-y-auto p-2">
              {!q.trim() && <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Digite o que procura. Ex.: “calabresa”, “taxa”, “Maria”, “3799…”</li>}
              {q.trim() && !dados && <li className="px-3 py-2 text-sm text-muted">Procurando…</li>}
              {q.trim() && dados && resultados.length === 0 && <li className="px-3 py-6 text-center text-muted">Nada encontrado para “{q}”.</li>}
              {resultados.map((r, i) => (
                <li key={`${r.grupo}-${r.href}-${r.titulo}-${i}`}>
                  <button type="button" onClick={() => ir(r)} onMouseEnter={() => setSel(i)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left ${i === sel ? "bg-creme-200" : ""}`}>
                    <r.Icone size={20} className="shrink-0 text-vinho-500" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.titulo}</span>
                      {r.sub && <span className="block truncate text-sm text-muted">{r.sub}</span>}
                    </span>
                    <span className="shrink-0 text-xs text-muted">{r.grupo}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

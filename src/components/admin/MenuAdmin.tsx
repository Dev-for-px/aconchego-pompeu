"use client";
// Editor do menu do site (topo no computador e menu do celular).
// Fica dentro de Ajustes: as mudanças só valem depois de "Salvar ajustes".
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, RotateCcw, Trash2 } from "lucide-react";
import { MENU_PADRAO, PAGINAS_MENU, type ItemMenu } from "@/lib/menu";
import { campoCls } from "./ui";

const OUTRO = "__outro";

export function MenuAdmin({ menu, onChange }: { menu: ItemMenu[]; onChange: (m: ItemMenu[]) => void }) {
  const mudar = (i: number, campo: Partial<ItemMenu>) => onChange(menu.map((x, j) => (j === i ? { ...x, ...campo } : x)));
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= menu.length) return;
    const novo = [...menu];
    [novo[i], novo[j]] = [novo[j], novo[i]];
    onChange(novo);
  };
  const botaoIcone = "flex h-10 w-10 items-center justify-center rounded-pill border border-linha bg-creme-50 text-ink disabled:opacity-30";

  return (
    <div className="space-y-3">
      <ol className="space-y-3">
        {menu.map((m, i) => {
          const conhecida = PAGINAS_MENU.some((p) => p.href === m.href);
          return (
            <li key={i} className={`space-y-2 rounded-md border border-linha p-3 ${m.ativo ? "bg-creme-50" : "bg-creme-200 opacity-70"}`}>
              <div className="flex items-end gap-2">
                <label className="block flex-1">
                  <span className="text-sm font-semibold text-ink">Nome no menu</span>
                  <input className={campoCls} value={m.rotulo} placeholder="Ex.: Bebidas" onChange={(e) => mudar(i, { rotulo: e.target.value })} />
                </label>
                <button type="button" aria-label={m.ativo ? `Esconder ${m.rotulo}` : `Mostrar ${m.rotulo}`} title={m.ativo ? "Aparecendo no site" : "Escondido"} onClick={() => mudar(i, { ativo: !m.ativo })}
                  className={`flex h-12 w-12 items-center justify-center rounded-pill border ${m.ativo ? "border-aberto bg-aberto text-creme-50" : "border-linha bg-creme-50 text-muted"}`}>
                  {m.ativo ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Leva para</span>
                <select className={campoCls} value={conhecida ? m.href : OUTRO} onChange={(e) => mudar(i, { href: e.target.value === OUTRO ? "https://" : e.target.value })}>
                  {PAGINAS_MENU.map((p) => <option key={p.href} value={p.href}>{p.rotulo} ({p.href})</option>)}
                  <option value={OUTRO}>Outro link (colar endereço)</option>
                </select>
              </label>
              {!conhecida && (
                <input className={campoCls} value={m.href} inputMode="url" autoCapitalize="none" placeholder="https://… ou /pagina" aria-label="Endereço do link" onChange={(e) => mudar(i, { href: e.target.value })} />
              )}
              <div className="flex items-center gap-2">
                <button type="button" className={botaoIcone} aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)}><ArrowUp size={18} /></button>
                <button type="button" className={botaoIcone} aria-label="Descer" disabled={i === menu.length - 1} onClick={() => mover(i, 1)}><ArrowDown size={18} /></button>
                <span className="flex-1 text-sm text-muted">{m.ativo ? "Aparece no site" : "Escondido"}</span>
                <button type="button" className="inline-flex items-center gap-1 text-sm text-fechado" onClick={() => onChange(menu.filter((_, j) => j !== i))}><Trash2 size={16} />Apagar</button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => onChange([...menu, { rotulo: "", href: "/", ativo: true }])} className="inline-flex items-center gap-1 font-semibold text-vinho-500"><Plus size={18} />Novo item no menu</button>
        <button type="button" onClick={() => { if (window.confirm("Voltar o menu para o padrão?")) onChange(MENU_PADRAO); }} className="inline-flex items-center gap-1 text-sm text-muted underline"><RotateCcw size={15} />Voltar ao padrão</button>
      </div>
    </div>
  );
}

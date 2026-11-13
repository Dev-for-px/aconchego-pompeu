"use client";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export const campoCls = "mt-1 w-full rounded-md border border-linha bg-creme-50 p-3 text-base text-ink outline-none focus:border-vinho-500";

export function Campo({ rotulo, dica, ...p }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; dica?: string }) {
  return (
    <label className="block">
      <span className="font-semibold text-ink">{rotulo}</span>
      {dica && <span className="block text-sm text-muted">{dica}</span>}
      <input {...p} className={campoCls} />
    </label>
  );
}

export function AreaTexto({ rotulo, dica, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { rotulo: string; dica?: string }) {
  return (
    <label className="block">
      <span className="font-semibold text-ink">{rotulo}</span>
      {dica && <span className="block text-sm text-muted">{dica}</span>}
      <textarea {...p} className={campoCls} />
    </label>
  );
}

export function Botao({ variante = "primario", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" | "perigo" | "verde" }) {
  const v = {
    primario: "bg-vinho-700 text-creme-50 hover:bg-vinho-800",
    secundario: "border border-linha bg-creme-50 text-ink hover:bg-creme-200",
    perigo: "border border-fechado bg-creme-50 text-fechado",
    verde: "bg-aberto text-creme-50",
  }[variante];
  return <button type="button" {...p} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-5 py-3 text-base font-semibold disabled:opacity-50 ${v} ${className}`} />;
}

/** Interruptor liga/desliga grande. */
export function Chave({ ligado, onChange, rotulo, descricao, disabled }: { ligado: boolean; onChange: (v: boolean) => void; rotulo: ReactNode; descricao?: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button" role="switch" aria-checked={ligado} disabled={disabled} onClick={() => onChange(!ligado)}
      className="flex w-full items-center justify-between gap-4 rounded-md border border-linha bg-creme-50 p-4 text-left disabled:opacity-60"
    >
      <span>
        <span className="block font-semibold text-ink">{rotulo}</span>
        {descricao && <span className="block text-sm text-muted">{descricao}</span>}
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-pill transition ${ligado ? "bg-aberto" : "bg-linha"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-pill bg-creme-50 transition-all ${ligado ? "left-7" : "left-1"}`} />
      </span>
    </button>
  );
}

export function Aviso({ tipo = "ok", children }: { tipo?: "ok" | "erro"; children: ReactNode }) {
  return <p role="status" className={`rounded-md px-4 py-3 text-sm font-semibold text-creme-50 ${tipo === "ok" ? "bg-aberto" : "bg-fechado"}`}>{children}</p>;
}

export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-ink">{children}</h1>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </div>
  );
}

export function traduzirErro(msg: string) {
  if (/Invalid login/i.test(msg)) return "Senha errada. Confira e tente de novo.";
  if (/duplicate key.*telefone/i.test(msg)) return "Já existe alguém com esse telefone.";
  if (/duplicate key.*usuario/i.test(msg)) return "Esse nome de usuário já está em uso.";
  if (/duplicate key.*(email|users_email)/i.test(msg)) return "Esse e-mail já está em uso.";
  if (/duplicate key.*slug/i.test(msg)) return "Já existe um produto com esse nome.";
  if (/rate limit|too many/i.test(msg)) return "Muitas tentativas. Espere um minuto e tente de novo.";
  return msg;
}

/** Caixa "Como usar esta tela" — explica a função para quem não tem costume com computador. */
export function Ajuda({ titulo = "Como usar esta tela", passos, dicas, aberta = false }: { titulo?: string; passos: ReactNode[]; dicas?: ReactNode[]; aberta?: boolean }) {
  return (
    <details open={aberta} className="group mb-6 rounded-md border border-dourado bg-dourado/15">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold text-ink">
        <span>💡 {titulo}</span>
        <span aria-hidden className="text-xl text-vinho-500 transition group-open:rotate-45">+</span>
      </summary>
      <div className="space-y-3 px-4 pb-4 text-ink">
        <ol className="list-decimal space-y-1.5 pl-5">{passos.map((p, i) => <li key={i}>{p}</li>)}</ol>
        {dicas && dicas.length > 0 && (
          <div className="rounded-md bg-creme-50 p-3 text-sm">
            <p className="font-semibold">Dicas</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">{dicas.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>
        )}
      </div>
    </details>
  );
}

/** Pequena explicação embaixo de um campo ou botão. */
export function Explica({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-sm text-muted">{children}</p>;
}

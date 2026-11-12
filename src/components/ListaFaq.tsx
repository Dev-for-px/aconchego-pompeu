import type { Faq } from "@/lib/dados";

export function ListaFaq({ faq, nivel = 3 }: { faq: Faq[]; nivel?: 2 | 3 }) {
  const H = nivel === 2 ? "h2" : "h3";
  return (
    <div className="divide-y divide-linha rounded-md border border-linha bg-creme-50">
      {faq.map((f) => (
        <details key={f.id} className="group p-4">
          <summary className="cursor-pointer list-none">
            <H className="flex items-center justify-between gap-4 font-sans text-base font-semibold text-ink">
              {f.pergunta}<span aria-hidden className="text-vinho-500 transition group-open:rotate-45">+</span>
            </H>
          </summary>
          <p className="mt-2 text-muted">{f.resposta}</p>
        </details>
      ))}
    </div>
  );
}

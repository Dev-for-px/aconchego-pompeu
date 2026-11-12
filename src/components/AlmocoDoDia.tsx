import type { Almoco } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";
import { BotaoWhatsApp } from "./Botoes";

function dataBonita(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12)).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

export function AlmocoDoDia({ almoco, mostrarPreco, nivel = 2 }: { almoco: Almoco; mostrarPreco: boolean; nivel?: 2 | 3 }) {
  const H = nivel === 2 ? "h2" : "h3";
  if (!almoco || almoco.itens.length === 0) {
    return (
      <div className="rounded-md border border-linha bg-creme-200 p-6 text-center">
        <p className="font-serif text-xl font-semibold text-ink">O cardápio de hoje sai em instantes</p>
        <p className="mt-2 text-muted">Servimos almoço todos os dias, das 11h às 15h: self-service de comida caseira, churrasco e marmitex.</p>
        <div className="mt-4"><BotaoWhatsApp texto="Perguntar o almoço de hoje" mensagem="Olá! Qual o cardápio do almoço de hoje?" /></div>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-linha bg-creme-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-vinho-500">
        <time dateTime={almoco.data}>{dataBonita(almoco.data)}</time>
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {almoco.itens.map((s) => (
          <section key={s.secao}>
            <H className="border-b border-linha pb-1 text-xl font-semibold text-ink">{s.secao}</H>
            <ul className="mt-2 space-y-1">
              {s.itens.map((i) => (
                <li key={i.nome} className="flex justify-between gap-3 text-ink">
                  <span>{i.nome}</span>
                  {mostrarPreco && i.preco != null && <span className="font-bold text-vinho-500">{formatarPreco(i.preco)}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-6"><BotaoWhatsApp texto="Pedir marmitex" mensagem="Olá! Quero pedir o almoço de hoje." /></div>
    </div>
  );
}

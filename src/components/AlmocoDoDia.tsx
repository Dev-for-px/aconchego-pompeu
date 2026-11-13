import type { Almoco } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";
import { BotaoWhatsApp } from "./Botoes";
import { AdicionarAlmoco } from "./AdicionarAlmoco";
import { AlmocoNoAr } from "./AlmocoNoAr";
import { MontarMarmita, type TipoMarmita } from "./MontarMarmita";
import { HORARIOS_PADRAO, hora, textoFaixa, type Horarios } from "@/lib/horario";

function dataBonita(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12)).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

export function AlmocoDoDia({ almoco, mostrarPreco, nivel = 2, horarios = HORARIOS_PADRAO, marmitas = [] }: { almoco: Almoco; mostrarPreco: boolean; nivel?: 2 | 3; horarios?: Horarios; marmitas?: TipoMarmita[] }) {
  const H = nivel === 2 ? "h2" : "h3";
  if (!almoco || almoco.itens.length === 0) {
    return (
      <div className="rounded-md border border-linha bg-creme-200 p-6 text-center">
        <p className="font-serif text-xl font-semibold text-ink">O cardápio de hoje sai em instantes</p>
        <p className="mt-2 text-muted">Almoço: {textoFaixa(horarios.almoco).toLowerCase()}. Self-service de comida caseira, churrasco e marmitex.</p>
        <div className="mt-4"><BotaoWhatsApp texto="Perguntar o almoço de hoje" mensagem="Olá! Qual o cardápio do almoço de hoje?" /></div>
      </div>
    );
  }
  const encerrado = (
    <div className="rounded-md border border-linha bg-creme-200 p-6 text-center">
      <p className="font-serif text-xl font-semibold text-ink">O almoço de hoje já encerrou</p>
      <p className="mt-2 text-muted">Servimos almoço até as {hora(horarios.almoco.fim)}. Amanhã tem cardápio novo a partir das {hora(horarios.almoco.inicio)}.</p>
    </div>
  );
  return (
    <AlmocoNoAr horarios={horarios} encerrado={encerrado}>
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
                <li key={i.nome} className="flex min-h-11 items-center justify-between gap-3 text-ink">
                  <span className="flex-1">{i.nome}</span>
                  {mostrarPreco && i.preco != null && <span className="font-bold text-vinho-500">{formatarPreco(i.preco)}</span>}
                  <AdicionarAlmoco nome={i.nome} grupo={`Almoço de ${almoco.data.split("-").reverse().slice(0, 2).join("/")}`} preco={i.preco ?? null} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <MontarMarmita tipos={marmitas} secoes={almoco.itens} grupo={`Marmitex – almoço de ${almoco.data.split("-").reverse().slice(0, 2).join("/")}`} mostrarPreco={mostrarPreco} />
      <p className="mt-6 text-sm text-muted">Toque no + para montar seu pedido, ou chame direto:</p>
      <div className="mt-2"><BotaoWhatsApp texto="Pedir marmitex no WhatsApp" mensagem="Olá! Quero pedir o almoço de hoje." /></div>
    </div>
    </AlmocoNoAr>
  );
}

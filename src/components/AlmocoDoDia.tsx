import type { Almoco } from "@/lib/dados";
import { BotaoWhatsApp } from "./Botoes";
import { AlmocoNoAr } from "./AlmocoNoAr";
import { MontarMarmita, type TipoMarmita } from "./MontarMarmita";
import { HORARIOS_PADRAO, hora, textoFaixa, type Horarios } from "@/lib/horario";

function dataBonita(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12)).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

// Almoço do dia: o cardápio é só para ler (quem come na casa se serve lá).
// Pelo site o pedido é sempre marmitex, montado em "Quero um marmitex".
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
  const dia = almoco.data.split("-").reverse().slice(0, 2).join("/");
  return (
    <AlmocoNoAr horarios={horarios} encerrado={encerrado}>
    <div className="rounded-md border border-linha bg-creme-50 p-4 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-vinho-500">
        <time dateTime={almoco.data}>{dataBonita(almoco.data)}</time>
      </p>
      <div className="mt-3 grid gap-5 md:grid-cols-2">
        {almoco.itens.map((s) => (
          <section key={s.secao}>
            <H className="border-b border-linha pb-1 text-xl font-semibold text-ink">{s.secao}</H>
            <ul className="mt-2 space-y-1.5 text-ink">
              {s.itens.map((i) => <li key={i.nome}>{i.nome}</li>)}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">Para comer aqui é só chegar: self-service das {hora(horarios.almoco.inicio)} às {hora(horarios.almoco.fim)}. Para entrega ou retirada, peça seu marmitex:</p>
      {marmitas.length > 0
        ? <MontarMarmita tipos={marmitas} secoes={almoco.itens} grupo={`Marmitex – almoço de ${dia}`} mostrarPreco={mostrarPreco} />
        : <div className="mt-3"><BotaoWhatsApp texto="Pedir marmitex no WhatsApp" mensagem="Olá! Quero pedir um marmitex do almoço de hoje." /></div>}
    </div>
    </AlmocoNoAr>
  );
}

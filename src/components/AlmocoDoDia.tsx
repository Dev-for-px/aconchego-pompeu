import type { Almoco } from "@/lib/dados";
import { Star } from "lucide-react";
import { ehEspecial } from "@/lib/marmitex";
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
    <div className="rounded-md border border-linha bg-creme-200 p-4 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <H className="text-xl font-semibold text-ink">Hoje tem</H>
        <p className="text-xs font-semibold uppercase tracking-wide text-vinho-500"><time dateTime={almoco.data}>{dataBonita(almoco.data)}</time></p>
      </div>
      <div className="mt-2 space-y-3">
        {almoco.itens.map((s) => (
          <section key={s.secao}>
            {(almoco.itens.length > 1 || s.secao !== "Cardápio do dia") && <p className="text-xs font-semibold uppercase tracking-wide text-muted">{s.secao}</p>}
            <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[15px] text-ink md:grid-cols-3">
              {s.itens.map((i) => {
                const especial = ehEspecial(i, s.secao);
                return (
                  <li key={i.nome} className={`flex items-center gap-1.5 ${especial ? "font-semibold" : ""}`}>
                    {especial ? <Star size={15} aria-label="Especial" className="shrink-0 fill-dourado text-vinho-500" /> : <span aria-hidden className="mx-1 h-1.5 w-1.5 shrink-0 rounded-pill bg-vinho-500" />}
                    {i.nome}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {marmitas.length > 0
        ? <MontarMarmita tipos={marmitas} secoes={almoco.itens} grupo={`Marmitex – almoço de ${dia}`} mostrarPreco={mostrarPreco} />
        : <div className="mt-3"><BotaoWhatsApp texto="Pedir marmitex no WhatsApp" mensagem="Olá! Quero pedir um marmitex do almoço de hoje." /></div>}
      <p className="mt-3 text-center text-sm text-muted">Entrega ou retirada. Prefere comer aqui? Self-service das {hora(horarios.almoco.inicio)} às {hora(horarios.almoco.fim)}, é só chegar.</p>
    </div>
    </AlmocoNoAr>
  );
}

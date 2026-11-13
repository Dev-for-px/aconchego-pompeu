import { Clock, CreditCard, MapPin } from "lucide-react";
import { ENDERECO_LINHA, NEGOCIO } from "@/lib/site";
import { diasSemJantar, textoFaixa, type Horarios } from "@/lib/horario";

export function InfoCasa({ formasPagamento, horarios }: { formasPagamento: string[]; horarios: Horarios }) {
  const sem = diasSemJantar(horarios);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold"><Clock size={22} className="text-vinho-500" aria-hidden />Horário de funcionamento</h3>
          <table className="mt-3 w-full text-left text-sm">
            <tbody className="divide-y divide-linha">
              <tr><th className="py-2 font-semibold">Almoço</th><td>{textoFaixa(horarios.almoco)}</td></tr>
              <tr><th className="py-2 font-semibold">Pizzaria e choperia</th><td>{textoFaixa(horarios.jantar)}</td></tr>
              {sem.length > 0 && <tr><th className="py-2 font-semibold first-letter:uppercase">{sem.join(", ")} à noite</th><td>Fechado</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold"><CreditCard size={22} className="text-vinho-500" aria-hidden />Formas de pagamento</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {formasPagamento.map((f) => <li key={f} className="rounded-pill border border-linha bg-creme-200 px-3 py-1 text-sm">{f}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold"><MapPin size={22} className="text-vinho-500" aria-hidden />Endereço</h3>
          <p className="mt-2">{ENDERECO_LINHA} ({NEGOCIO.endereco.referencia})</p>
          <a href={NEGOCIO.mapsBusca} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-pill bg-vinho-700 px-5 py-2 font-semibold text-creme-50 hover:bg-vinho-800">Como chegar</a>
        </div>
      </div>
      <iframe
        title="Mapa: Restaurante e Pizzaria Aconchego em Pompéu – MG"
        src={NEGOCIO.mapsEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-80 w-full rounded-md border border-linha md:h-full"
      />
    </div>
  );
}

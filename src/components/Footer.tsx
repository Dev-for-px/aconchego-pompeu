import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { IconeRede } from "./IconeRede";
import { redesAtivas, type Redes } from "@/lib/redes";
import { diasSemJantar, textoFaixa, type Horarios } from "@/lib/horario";
import { ENDERECO_LINHA, NEGOCIO, formatarTelefone, linkWhatsApp } from "@/lib/site";

const fora = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Footer({ redes, horarios }: { redes: Redes; horarios: Horarios }) {
  const ativas = redesAtivas(redes);
  return (
    <footer className="mt-12 bg-vinho-700 pb-20 text-creme-50 md:pb-6">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo variante="branca" altura={64} />
          <p className="mt-4 text-sm opacity-90">Restaurante, pizzaria, choperia e churrascaria em Pompéu – MG desde {NEGOCIO.desde}.</p>
          {ativas.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Redes sociais">
              {ativas.map((r) => (
                <li key={r.chave}>
                  <a href={r.url} {...fora} aria-label={`${r.nome} do Aconchego`} title={r.nome}
                    className="flex h-11 w-11 items-center justify-center rounded-pill border border-creme-50/30 hover:bg-vinho-800">
                    <IconeRede rede={r.chave} size={20} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <address className="space-y-2 text-sm not-italic">
          <p className="flex gap-2"><MapPin size={20} className="shrink-0" aria-hidden /> <span>{ENDERECO_LINHA}<br /><span className="opacity-80">({NEGOCIO.endereco.referencia})</span></span></p>
          <p className="flex gap-2"><Phone size={20} className="shrink-0" aria-hidden /> <span>Telefone: <a className="underline" href={`tel:+${NEGOCIO.telefone}`}>{formatarTelefone(NEGOCIO.telefone)}</a><br />WhatsApp: <a className="underline" href={linkWhatsApp()} {...fora}>{formatarTelefone(NEGOCIO.whatsapp)}</a></span></p>
        </address>
        <div className="space-y-2 text-sm">
          <p className="flex gap-2"><Clock size={20} className="shrink-0" aria-hidden /> <span>Almoço: {textoFaixa(horarios.almoco).toLowerCase()}<br />Pizzaria e choperia: {textoFaixa(horarios.jantar).toLowerCase()}{diasSemJantar(horarios).length > 0 && ` (${diasSemJantar(horarios).join(", ")} à noite fechado)`}</span></p>
          <p className="flex flex-wrap gap-4 pt-2 font-semibold">
            <Link className="underline" href="/perguntas-frequentes">Perguntas frequentes</Link>
            <Link className="underline" href="/novidades">Novidades</Link>
            <Link className="underline" href="/contato">Como chegar</Link>
          </p>
          <p className="pt-3 font-script text-3xl">Feito com carinho</p>
        </div>
      </div>
      <p className="border-t border-vinho-800 px-4 py-3 text-center text-[11px] opacity-70">
        Desenvolvido por <a href="https://pharconsultoria.com" {...fora} className="underline">PHAR Consultoria</a>
      </p>
    </footer>
  );
}

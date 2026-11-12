import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { ENDERECO_LINHA, NEGOCIO, formatarTelefone, linkWhatsApp } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-12 bg-vinho-700 pb-24 text-creme-50 md:pb-10">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo variante="branca" altura={56} />
          <p className="mt-4 text-sm opacity-90">{NEGOCIO.nomeEstendido} em Pompéu – MG desde {NEGOCIO.desde}.</p>
          <p className="mt-3 font-script text-3xl">Feito com carinho</p>
        </div>
        <address className="space-y-2 text-sm not-italic">
          <p className="flex gap-2"><MapPin size={20} className="shrink-0" aria-hidden /> <span>{ENDERECO_LINHA}<br /><span className="opacity-80">({NEGOCIO.endereco.referencia})</span></span></p>
          <p className="flex gap-2"><Phone size={20} className="shrink-0" aria-hidden /> <span>Telefone: <a className="underline" href={`tel:+${NEGOCIO.telefone}`}>{formatarTelefone(NEGOCIO.telefone)}</a><br />WhatsApp: <a className="underline" href={linkWhatsApp()}>{formatarTelefone(NEGOCIO.whatsapp)}</a></span></p>
        </address>
        <div className="space-y-2 text-sm">
          <p className="flex gap-2"><Clock size={20} className="shrink-0" aria-hidden /> <span>Almoço: todos os dias, 11h às 15h<br />Pizzaria e choperia: 18h à meia-noite (exceto segunda)</span></p>
          <p className="flex flex-wrap gap-4 pt-2 font-semibold">
            <a className="underline" href={NEGOCIO.instagram} rel="noopener">Instagram</a>
            <Link className="underline" href="/perguntas-frequentes">Perguntas frequentes</Link>
            <Link className="underline" href="/contato">Como chegar</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

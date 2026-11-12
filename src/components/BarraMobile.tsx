import { MapPin, MessageCircle, Phone } from "lucide-react";
import { NEGOCIO, linkWhatsApp } from "@/lib/site";

export function BarraMobile() {
  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold";
  return (
    <nav aria-label="Contato rápido" className="fixed inset-x-0 bottom-0 z-50 flex border-t border-linha bg-creme-50 md:hidden">
      <a href={`tel:+${NEGOCIO.telefone}`} className={`${item} text-vinho-500`}><Phone size={22} aria-hidden />Ligar</a>
      <a href={linkWhatsApp("Olá! Vim pelo site do Aconchego.")} target="_blank" rel="noopener noreferrer" className={`${item} bg-aberto text-creme-50`}><MessageCircle size={22} aria-hidden />WhatsApp</a>
      <a href={NEGOCIO.mapsBusca} target="_blank" rel="noopener noreferrer" className={`${item} text-vinho-500`}><MapPin size={22} aria-hidden />Como chegar</a>
    </nav>
  );
}

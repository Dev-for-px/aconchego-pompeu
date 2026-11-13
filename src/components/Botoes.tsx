import { MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/site";

export function BotaoWhatsApp({ texto = "Pedir no WhatsApp", mensagem = "Olá! Vim pelo site do Aconchego.", compacto = false }: { texto?: string; mensagem?: string; compacto?: boolean }) {
  return (
    <a href={linkWhatsApp(mensagem)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-pill bg-aberto font-semibold text-creme-50 hover:opacity-90 ${compacto ? "px-4 py-2.5 text-[15px] md:px-6 md:py-3 md:text-base" : "px-6 py-3 text-base"}`}>
      <MessageCircle size={20} aria-hidden />{texto}
    </a>
  );
}

import { MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/site";

export function BotaoWhatsApp({ texto = "Pedir no WhatsApp", mensagem = "Olá! Vim pelo site do Aconchego." }: { texto?: string; mensagem?: string }) {
  return (
    <a href={linkWhatsApp(mensagem)} className="inline-flex items-center justify-center gap-2 rounded-pill bg-aberto px-6 py-3 text-base font-semibold text-creme-50 hover:opacity-90">
      <MessageCircle size={20} aria-hidden />{texto}
    </a>
  );
}

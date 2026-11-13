import type { Metadata } from "next";
import { PaginaLocal } from "@/components/PaginaLocal";
import { textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: "Delivery em Pompéu – MG | Pizza, marmitex e porções do Aconchego",
  description: "Peça delivery em Pompéu – MG: marmitex no almoço, pizza e porções à noite. Pedido pronto pelo WhatsApp em poucos toques, retirada no balcão ou pelo Aiqfome.",
  alternates: { canonical: "/delivery-em-pompeu" },
};

export default function Page() {
  return (
    <PaginaLocal
      url="/delivery-em-pompeu" nome="Delivery em Pompéu" turno="ambos"
      h1="Delivery em Pompéu – MG: peça no Aconchego"
      intro={[
        "O Aconchego entrega em Pompéu no almoço e à noite. No almoço saem as marmitex; à noite, pizzas, porções na chapa, crepes e massas.",
      ]}
      blocos={[
        { titulo: "Como pedir", texto: "Pelo site: escolha os itens no cardápio, toque em Ver pedido e envie — a mensagem chega pronta no WhatsApp do restaurante. Se preferir, chame direto no WhatsApp (37) 99994-3111 ou peça pelo Aiqfome." },
        { titulo: "Entrega ou retirada", texto: "Você escolhe receber em casa ou buscar no balcão, na Praça Carlos Elói, 542, centro. Também dá para comer no salão." },
        { titulo: "Formas de pagamento", texto: "Dinheiro, Pix, cartão de débito, cartão de crédito e vale-refeição." },
      ]}
      categorias={["marmitex", "pizzas", "porcoes-na-chapa"]} tituloItens="O que pedir no delivery"
      faq={(c) => [
        { pergunta: "Qual a taxa de entrega do Aconchego?", resposta: c.taxa_entrega ? `A taxa de entrega em Pompéu é de R$ ${c.taxa_entrega.toFixed(2).replace(".", ",")}.` : "A taxa é informada no WhatsApp ao confirmar o pedido." },
        { pergunta: "Em que horário tem delivery?", resposta: `Almoço: ${textoFaixa(c.horarios.almoco).toLowerCase()}. Noite: ${textoFaixa(c.horarios.jantar).toLowerCase()}.` },
        { pergunta: "O Aconchego está no Aiqfome?", resposta: "Sim. Também dá para pedir pelo Aiqfome, mas pelo site o pedido vai direto para o WhatsApp do restaurante." },
      ]}
      cta={{ texto: "Montar meu pedido", href: "/cardapio" }}
      mensagem="Olá! Vim pela página de delivery e quero fazer um pedido."
    />
  );
}

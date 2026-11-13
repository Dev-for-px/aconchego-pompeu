import type { Metadata } from "next";
import { PaginaLocal } from "@/components/PaginaLocal";
import { textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: "Pizzaria em Pompéu – MG | Pizzaria Aconchego, pizza com entrega",
  description: "Pizzaria no centro de Pompéu – MG: mais de 20 sabores, do brotinho à família de 12 pedaços, meio a meio e borda recheada. Peça pelo WhatsApp ou venha comer com chopp gelado.",
  alternates: { canonical: "/pizzaria-em-pompeu" },
};

export default function Page() {
  return (
    <PaginaLocal
      url="/pizzaria-em-pompeu" nome="Pizzaria em Pompéu" turno="noite"
      h1="Pizzaria em Pompéu – MG: Pizzaria Aconchego"
      intro={[
        "Procurando pizzaria em Pompéu? A Pizzaria Aconchego fica na Praça Carlos Elói, no centro da cidade, e serve pizza desde 2010 — para comer no salão, retirar no balcão ou receber em casa.",
        "São mais de 20 sabores entre tradicionais, especiais e doces, em seis tamanhos: brotinho, pequena (4 pedaços), média (6), grande (8), gigante (10) e família (12 pedaços).",
      ]}
      blocos={[
        { titulo: "Meio a meio e borda recheada", texto: "Toda pizza pode ser meio a meio com qualquer outro sabor (cobra-se o valor do sabor mais caro). Dá para pedir borda recheada de catupiry ou de cheddar com catupiry e adicionais como bacon, calabresa, palmito e cheddar." },
        { titulo: "Sabores mais pedidos", texto: "A Pizza Aconchego, a especialidade da casa, leva muçarela, presunto, frango, calabresa, milho e catupiry. Também saem muito a calabresa, a quatro queijos, a carne seca com catupiry, a frango com catupiry e a 3 Porquinhos. Tem opções vegetarianas e pizzas doces de banana e de chocolate." },
        { titulo: "Pizza com chopp no centro de Pompéu", texto: "À noite o Aconchego vira pizzaria e choperia: além da pizza, tem porções na chapa, crepes, massas e chopp gelado. O salão tem área externa, Wi-Fi, TV para os jogos e estacionamento por perto." },
      ]}
      categorias={["pizzas", "pizzas-doces"]} tituloItens="Sabores de pizza do Aconchego"
      faq={(c) => [
        { pergunta: "Qual o horário da Pizzaria Aconchego?", resposta: `${textoFaixa(c.horarios.jantar)}, na Praça Carlos Elói, 542, centro de Pompéu – MG.` },
        { pergunta: "A Pizzaria Aconchego entrega pizza em Pompéu?", resposta: `Sim. A entrega é feita em Pompéu pelo WhatsApp (37) 99994-3111, pelo pedido do site ou pelo Aiqfome${c.taxa_entrega ? `; a taxa de entrega é de R$ ${c.taxa_entrega.toFixed(2).replace(".", ",")}` : ""}.` },
        { pergunta: "Qual o maior tamanho de pizza?", resposta: "A pizza família, com 12 pedaços. Também há brotinho, pequena (4), média (6), grande (8) e gigante (10 pedaços)." },
        { pergunta: "Pode pedir pizza meio a meio?", resposta: "Pode. Qualquer pizza sai meio a meio com outro sabor, e o valor é o do sabor mais caro." },
      ]}
      cta={{ texto: "Ver o cardápio de pizzas", href: "/cardapio/pizzas" }}
      mensagem="Olá! Vim pela página da pizzaria e quero pedir uma pizza."
    />
  );
}

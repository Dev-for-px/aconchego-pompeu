import type { Metadata } from "next";
import { PaginaLocal } from "@/components/PaginaLocal";
import { textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: "Almoço em Pompéu – MG | Self-service e churrasco no Restaurante Aconchego",
  description: "Almoço todos os dias no centro de Pompéu – MG: self-service de comida caseira, churrasco, prato feito e marmitex para entrega. Veja o cardápio de hoje.",
  alternates: { canonical: "/almoco-em-pompeu" },
};

export default function Page() {
  return (
    <PaginaLocal
      url="/almoco-em-pompeu" nome="Almoço em Pompéu" turno="almoco"
      h1="Almoço em Pompéu – MG: Restaurante Aconchego"
      intro={[
        "Para almoçar bem no centro de Pompéu, o Restaurante Aconchego serve comida caseira todos os dias, inclusive sábado, domingo e feriado.",
        "O almoço tem self-service com pratos quentes, saladas e churrasco, além de opções à la carte e marmitex para levar ou receber em casa.",
      ]}
      blocos={[
        { titulo: "Self-service de comida caseira", texto: "Arroz, feijão, carnes, guarnições e saladas feitos no dia, no estilo mineiro. O cardápio muda diariamente e é publicado no site na página Almoço de hoje, para você saber o que tem antes de sair de casa." },
        { titulo: "Churrasco no almoço", texto: "O churrasco acompanha o self-service, para quem quer uma carne na brasa no meio da semana sem ir longe do centro." },
        { titulo: "Marmitex para entrega ou retirada", texto: "Quem não pode sair do trabalho pede a marmitex pelo WhatsApp ou pelo site e recebe em Pompéu, ou passa para buscar no balcão." },
        { titulo: "Chopp e bebidas no almoço", texto: "O Aconchego também é choperia no almoço: tem chopp gelado, refrigerantes, água e suco natural." },
      ]}
      categorias={["self-service", "marmitex"]} tituloItens="No almoço do Aconchego"
      faq={(c) => [
        { pergunta: "Qual o horário do almoço do Aconchego?", resposta: `${textoFaixa(c.horarios.almoco)}, na Praça Carlos Elói, 542, centro de Pompéu – MG.` },
        { pergunta: "Onde vejo o cardápio do almoço de hoje?", resposta: "Na página Almoço de hoje do site. O cardápio é atualizado todo dia pela equipe do restaurante." },
        { pergunta: "O Aconchego abre para almoço no domingo?", resposta: "Sim, o almoço funciona todos os dias, inclusive domingo." },
        { pergunta: "Tem marmitex com entrega em Pompéu?", resposta: "Tem. A marmitex do almoço pode ser pedida pelo WhatsApp (37) 99994-3111 ou pelo site, para entrega ou retirada." },
      ]}
      cta={{ texto: "Ver o almoço de hoje", href: "/almoco-hoje" }}
      mensagem="Olá! Vim pela página do almoço. Qual o cardápio de hoje?"
    />
  );
}

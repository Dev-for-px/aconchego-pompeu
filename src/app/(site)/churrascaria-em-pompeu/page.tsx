import type { Metadata } from "next";
import { PaginaLocal } from "@/components/PaginaLocal";
import { textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: { absolute: "Churrascaria em Pompéu – MG | Churrasco e picanha no Aconchego" },
  description: "Churrasco no almoço e picanha na chapa à noite, no centro de Pompéu – MG. Restaurante e churrascaria Aconchego: carnes no peso, porções completas e chopp.",
  alternates: { canonical: "/churrascaria-em-pompeu" },
};

export default function Page() {
  return (
    <PaginaLocal
      url="/churrascaria-em-pompeu" nome="Churrascaria em Pompéu" turno="ambos"
      h1="Churrascaria em Pompéu – MG: churrasco e picanha no Aconchego"
      intro={[
        "O Aconchego é restaurante e churrascaria no centro de Pompéu: no almoço, o churrasco acompanha o self-service de comida caseira; à noite, as carnes vão para a chapa.",
      ]}
      blocos={[
        { titulo: "Churrasco no almoço", texto: "Todos os dias, junto do self-service, com as guarnições e saladas do dia. Uma opção prática para quem trabalha no centro." },
        { titulo: "Picanha na chapa à noite", texto: "Picanha, filé, contra filé e lombo na chapa vendidos no peso, de 300 g a 1 kg, com farofa e vinagrete. Para dividir, as porções completas trazem fritas, mandioca, torresmo e queijo." },
        { titulo: "Para acompanhar", texto: "Arroz branco ou ao alho, tropeiro, caldo de mandioca, pão de alho e chopp gelado." },
      ]}
      categorias={["carne-na-chapa", "porcoes-na-chapa"]} tituloItens="Carnes e porções"
      faq={(c) => [
        { pergunta: "Tem churrasco no almoço do Aconchego?", resposta: `Sim. O churrasco é servido no almoço, ${textoFaixa(c.horarios.almoco).toLowerCase()}, junto com o self-service.` },
        { pergunta: "Como é a picanha na chapa?", resposta: "É vendida no peso, de 300 g a 1 kg, e acompanha farofa e vinagrete. Também há a porção completa de picanha ou filé, em meia (400 g) ou inteira (600 g)." },
        { pergunta: "Onde fica a churrascaria Aconchego?", resposta: "Na Praça Carlos Elói, 542, centro de Pompéu – MG, próximo à Eletro Zema." },
      ]}
      cta={{ texto: "Ver carnes e porções", href: "/cardapio/carne-na-chapa" }}
      mensagem="Olá! Vim pela página da churrascaria e quero fazer um pedido."
    />
  );
}

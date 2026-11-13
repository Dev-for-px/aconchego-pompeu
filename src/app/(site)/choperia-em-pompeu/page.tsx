import type { Metadata } from "next";
import { PaginaLocal } from "@/components/PaginaLocal";
import { textoFaixa } from "@/lib/horario";

export const metadata: Metadata = {
  title: { absolute: "Choperia em Pompéu – MG | Chopp gelado e porções no Aconchego" },
  description: "Choperia no centro de Pompéu – MG: chopp gelado no almoço e à noite, porções na chapa, pizza, TV para os jogos e área externa. Aconchego, desde 2010.",
  alternates: { canonical: "/choperia-em-pompeu" },
};

export default function Page() {
  return (
    <PaginaLocal
      url="/choperia-em-pompeu" nome="Choperia em Pompéu" turno="noite"
      h1="Choperia em Pompéu – MG: chopp gelado no Aconchego"
      intro={[
        "Chopp gelado no centro de Pompéu, do almoço até a meia-noite. O Aconchego é choperia, bar e pizzaria na Praça Carlos Elói, com área externa e TV para assistir aos jogos.",
      ]}
      blocos={[
        { titulo: "Chopp com porção na chapa", texto: "À noite, o chopp acompanha porções para dividir: picanha ou filé completo, chapa mista, isca de tilápia, frango à passarinho, fritas com queijo e bacon, torresmo e mandioca." },
        { titulo: "Cervejas e drinks", texto: "Além do chopp, há cervejas, drinks e doses. O cardápio completo de bebidas está no site, na seção Chopp, cervejas e drinks." },
        { titulo: "Para a turma e para os jogos", texto: "Mesas na área externa, Wi-Fi e TV ligada nos jogos. Bom lugar para reunir os amigos depois do trabalho." },
      ]}
      categorias={["porcoes-na-chapa", "tabua-de-frios"]} tituloItens="Para acompanhar o chopp"
      faq={(c) => [
        { pergunta: "Até que horas tem chopp no Aconchego?", resposta: `À noite: ${textoFaixa(c.horarios.jantar).toLowerCase()}. No almoço também tem chopp, ${textoFaixa(c.horarios.almoco).toLowerCase()}.` },
        { pergunta: "O Aconchego passa jogos de futebol?", resposta: "Sim, o salão tem TV para os jogos, além de área externa e Wi-Fi." },
        { pergunta: "Pode menor de idade consumir bebida alcoólica?", resposta: "Não. A venda de bebidas alcoólicas é proibida para menores de 18 anos." },
      ]}
      cta={{ texto: "Ver o cardápio da noite", href: "/cardapio" }}
      mensagem="Olá! Vim pela página da choperia. Queria saber mais."
    />
  );
}

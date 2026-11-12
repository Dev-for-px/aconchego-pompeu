// Gera o llms.txt (resumo para IAs) e o llms-full.txt (resumo + cardápio + FAQ).
import { getAlmocoHoje, getCardapio, getConfig, getFaq } from "./dados";
import { ENDERECO_LINHA, NEGOCIO, SITE_URL, formatarPreco, formatarTelefone } from "./site";

function cabecalho() {
  return `# ${NEGOCIO.nome}

> ${NEGOCIO.nomeEstendido} no centro de Pompéu – MG (Minas Gerais, Brasil), desde ${NEGOCIO.desde}. De dia restaurante, churrascaria e choperia (almoço caseiro, self-service, marmitex, chopp); à noite Bar Aconchego: bar, pizzaria e choperia (pizzas, crepes, porções na chapa, chopp).

- Endereço: ${ENDERECO_LINHA} (${NEGOCIO.endereco.referencia})
- Telefone: ${formatarTelefone(NEGOCIO.telefone)}
- WhatsApp (pedidos e reservas): ${formatarTelefone(NEGOCIO.whatsapp)}
- Almoço: todos os dias, 11h às 15h
- Pizzaria e choperia: terça a domingo, 18h à meia-noite (segunda à noite fechado)
- Delivery próprio (taxa a partir de R$ 4,00) e pelo Aiqfome; retirada no local
- Pagamento: ${NEGOCIO.formasPagamento.join(", ")}
- Estrutura: ${NEGOCIO.comodidades.join(", ")}
- Instagram: ${NEGOCIO.instagram}
`;
}

export async function llmsTxt() {
  return `${cabecalho()}
## Páginas
- [Almoço de hoje](${SITE_URL}/almoco-hoje): cardápio do almoço, atualizado todo dia
- [Cardápio](${SITE_URL}/cardapio): pizzas, porções na chapa, chopp e bebidas
- [Perguntas frequentes](${SITE_URL}/perguntas-frequentes): horário, delivery, pagamento, reservas
- [Sobre](${SITE_URL}/sobre): história e fatos sobre o restaurante
- [Contato](${SITE_URL}/contato): endereço, mapa e telefones
- [Novidades](${SITE_URL}/novidades): promoções, eventos e avisos

## Opcional
- [Versão completa para IAs](${SITE_URL}/llms-full.txt): cardápio e FAQ em texto
`;
}

export async function llmsFullTxt() {
  const [config, cardapio, almoco, faq] = await Promise.all([getConfig(), getCardapio(), getAlmocoHoje(), getFaq()]);
  let txt = cabecalho();
  txt += `\n## Almoço de hoje\n`;
  if (almoco) {
    txt += `Data: ${almoco.data}\n`;
    for (const s of almoco.itens) txt += `\n### ${s.secao}\n${s.itens.map((i) => `- ${i.nome}`).join("\n")}\n`;
  } else {
    txt += "O cardápio do almoço muda todo dia e é publicado no site pela manhã. Consulte o WhatsApp.\n";
  }
  txt += `\n## Cardápio\n`;
  for (const c of cardapio.filter((c) => c.produtos.length)) {
    txt += `\n### ${c.nome}\n`;
    for (const p of c.produtos) {
      const precos = !config.mostrar_precos ? null
        : p.variacoes.length ? p.variacoes.map((v) => `${v.nome} ${formatarPreco(v.preco) ?? ""}`.trim()).join(" · ")
        : formatarPreco(p.preco);
      txt += `- ${p.nome}${p.descricao ? `: ${p.descricao}` : ""}${precos ? ` (${precos})` : ""}\n`;
    }
  }
  txt += `\n## Perguntas frequentes\n`;
  for (const f of faq) txt += `\n### ${f.pergunta}\n${f.resposta}\n`;
  return txt;
}

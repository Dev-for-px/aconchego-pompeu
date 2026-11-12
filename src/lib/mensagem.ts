// Monta o texto do pedido que vai pronto para o WhatsApp.
import { precoItem, type ItemCarrinho } from "./carrinho";
import { formatarPreco } from "./site";

export type DadosCliente = {
  nome: string;
  tipo: "entrega" | "retirada" | "mesa";
  endereco: string;
  referencia: string;
  pagamento: string;
  troco: string;
  obs: string;
};

export function montarMensagem(itens: ItemCarrinho[], cliente: DadosCliente, mostrarPrecos: boolean, taxaEntrega: number | null) {
  const linhas: string[] = ["*Novo pedido pelo site* 🍽️", ""];
  const grupos = [...new Set(itens.map((i) => i.grupo))];
  let soma = 0;
  let aConfirmar = false;
  for (const g of grupos) {
    linhas.push(`*${g}*`);
    for (const i of itens.filter((x) => x.grupo === g)) {
      const valor = mostrarPrecos ? precoItem(i) : null;
      if (valor == null) aConfirmar = true;
      else soma += valor;
      linhas.push(`• ${i.qtd}x ${i.nome}${valor != null ? ` — ${formatarPreco(valor)}` : ""}`);
      if (i.adicionais.length) linhas.push(`   + ${i.adicionais.map((a) => a.nome).join(", ")}`);
      if (i.obs.trim()) linhas.push(`   Obs.: ${i.obs.trim()}`);
    }
    linhas.push("");
  }

  if (mostrarPrecos && soma > 0) {
    linhas.push(`Subtotal: ${formatarPreco(soma)}${aConfirmar ? " + itens a confirmar" : ""}`);
    if (cliente.tipo === "entrega" && taxaEntrega != null) linhas.push(`Taxa de entrega: a partir de ${formatarPreco(taxaEntrega)} (confirmar pelo endereço)`);
  } else {
    linhas.push("Valor: a confirmar");
  }
  linhas.push("");

  linhas.push(`*Nome:* ${cliente.nome.trim()}`);
  if (cliente.tipo === "entrega") {
    linhas.push("*Entrega*");
    linhas.push(`Endereço: ${cliente.endereco.trim()}`);
    if (cliente.referencia.trim()) linhas.push(`Referência: ${cliente.referencia.trim()}`);
  } else if (cliente.tipo === "retirada") {
    linhas.push("*Retirada no restaurante*");
  } else {
    linhas.push("*Consumo no local*");
  }
  linhas.push(`*Pagamento:* ${cliente.pagamento}${cliente.pagamento === "Dinheiro" && cliente.troco.trim() ? ` (troco para ${cliente.troco.trim()})` : ""}`);
  if (cliente.obs.trim()) linhas.push(`*Observação:* ${cliente.obs.trim()}`);
  return linhas.join("\n");
}

// Aviso "Já vai?" — sem dependências de servidor (usado também no painel)
export type Saida = { ativo: boolean; titulo: string; texto: string; botao: "whatsapp" | "ligar" | "cardapio"; textoBotao: string };
export const SAIDA_PADRAO: Saida = {
  ativo: false,
  titulo: "Já vai? Bateu a fome? 🍕",
  texto: "Peça agora pelo WhatsApp e receba quentinho em casa.",
  botao: "whatsapp",
  textoBotao: "Pedir no WhatsApp",
};

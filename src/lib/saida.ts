// Aviso "Já vai?" — sem dependências de servidor (usado também no painel)
export type Saida = { ativo: boolean; titulo: string; texto: string; botao: "whatsapp" | "ligar" | "cardapio"; textoBotao: string };
export const SAIDA_PADRAO: Saida = {
  ativo: false,
  titulo: "Já vai? Bateu a fome? 🍕",
  texto: "Peça agora pelo WhatsApp e receba quentinho em casa.",
  botao: "whatsapp",
  textoBotao: "Pedir no WhatsApp",
};

/** Marca de "já mostrou nesta visita" (sessionStorage). */
export const CHAVE_AVISO_SAIDA = "aconchego:aviso-saida";

/** Quem já mandou o pedido não precisa ver o aviso. */
export function dispensarAvisoSaida() {
  try { sessionStorage.setItem(CHAVE_AVISO_SAIDA, "1"); } catch {}
}

// Busca sem acento e sem diferença de maiúsculas ("Ze" acha "José", "acai" acha "Açaí").
export const normalizar = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Todas as palavras da busca aparecem no texto (em qualquer ordem). */
export function combina(busca: string, ...campos: (string | null | undefined)[]) {
  const alvo = normalizar(campos.join(" "));
  const alvoDigitos = alvo.replace(/\D/g, "");
  return normalizar(busca).split(/\s+/).filter(Boolean).every((p) => alvo.includes(p) || (/^\d{3,}$/.test(p) && alvoDigitos.includes(p)));
}

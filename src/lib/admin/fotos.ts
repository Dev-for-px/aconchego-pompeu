// Reduz a foto no próprio celular (máx. 1200 px, WebP) antes de enviar — economiza internet e deixa o site rápido.
export async function prepararFoto(arquivo: File, maximo = 1200): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, maximo / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise((ok, falha) => canvas.toBlob((b) => (b ? ok(b) : falha(new Error("Não deu para ler a foto"))), "image/webp", 0.82));
}

export function slugificar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

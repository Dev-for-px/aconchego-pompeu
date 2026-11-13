// Prepara a foto no próprio celular antes de enviar: reduz (máx. 1200 px) e converte para WebP.
// Com `quadrada`, a foto vira um quadrado SEM cortar nada: ela é encaixada inteira e as sobras
// recebem a cor creme do site (como uma moldura).
export async function prepararFoto(arquivo: File, maximo = 1200, quadrada = false): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, maximo / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  if (quadrada) {
    const lado = Math.max(w, h);
    canvas.width = lado;
    canvas.height = lado;
    ctx.fillStyle = "#F1E6D6"; // creme-200 do Design System
    ctx.fillRect(0, 0, lado, lado);
    ctx.drawImage(bitmap, Math.round((lado - w) / 2), Math.round((lado - h) / 2), w, h);
  } else {
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bitmap, 0, 0, w, h);
  }
  return await new Promise((ok, falha) => canvas.toBlob((b) => (b ? ok(b) : falha(new Error("Não deu para ler a foto"))), "image/webp", 0.82));
}

export function slugificar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

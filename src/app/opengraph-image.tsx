import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Restaurante e Pizzaria Aconchego – Pompéu – MG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), "public/marca/logo-branca-sem-fundo.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#7E080D", color: "#FBF6EF" }}>
        <img src={src} width={738} height={300} alt="" />
        <div style={{ fontSize: 36, marginTop: 40 }}>Almoço todos os dias · Pizzaria e chopp à noite</div>
        <div style={{ fontSize: 30, marginTop: 12, opacity: 0.85 }}>Centro de Pompéu – MG · WhatsApp (37) 99994-3111</div>
      </div>
    ),
    size,
  );
}

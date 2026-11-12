import { ImageResponse } from "next/og";

export const alt = "Restaurante e Pizzaria Aconchego – Pompéu – MG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#7E080D", color: "#FBF6EF" }}>
        <div style={{ fontSize: 96, fontWeight: 700 }}>Aconchego</div>
        <div style={{ fontSize: 32, letterSpacing: 6, marginTop: 8 }}>RESTAURANTE E PIZZARIA</div>
        <div style={{ fontSize: 36, marginTop: 48 }}>Almoço todos os dias · Pizzaria e chopp à noite</div>
        <div style={{ fontSize: 30, marginTop: 12, opacity: 0.85 }}>Centro de Pompéu – MG · WhatsApp (37) 99994-3111</div>
      </div>
    ),
    size,
  );
}

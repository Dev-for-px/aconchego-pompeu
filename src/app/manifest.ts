import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Restaurante e Pizzaria Aconchego",
    short_name: "Aconchego",
    description: "Cardápio e pedidos do Aconchego – Pompéu – MG",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6EF",
    theme_color: "#7E080D",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

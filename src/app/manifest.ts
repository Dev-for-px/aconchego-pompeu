import type { MetadataRoute } from "next";

// App instalável (PWA): no Android aparece "Instalar app"; no iPhone, Compartilhar › Adicionar à Tela de Início.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Restaurante e Pizzaria Aconchego",
    short_name: "Aconchego",
    description: "Cardápio e pedidos do Aconchego – Pompéu – MG",
    start_url: "/?origem=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF6EF",
    theme_color: "#7E080D",
    lang: "pt-BR",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Almoço de hoje", url: "/almoco-hoje", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Cardápio da pizzaria", url: "/cardapio", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Meu pedido", url: "/pedido", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}

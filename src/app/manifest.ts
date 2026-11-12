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
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

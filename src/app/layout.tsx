import type { Metadata, Viewport } from "next";
import { Great_Vibes, Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BarraMobile } from "@/components/BarraMobile";
import { JsonLd } from "@/components/JsonLd";
import { BarraCarrinho } from "@/components/BarraCarrinho";
import { CarrinhoProvider } from "@/lib/carrinho";
import { getConfig } from "@/lib/dados";
import { restauranteJsonLd } from "@/lib/schema";
import { NEGOCIO, SITE_URL } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Restaurante e Pizzaria Aconchego | Pompéu – MG",
    template: "%s | Aconchego Pompéu – MG",
  },
  description:
    "Restaurante, churrascaria e choperia no almoço; bar, pizzaria e choperia à noite. No centro de Pompéu – MG. Peça pelo WhatsApp (37) 99994-3111.",
  applicationName: NEGOCIO.nome,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "pt_BR", siteName: NEGOCIO.nome, url: SITE_URL },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#7E080D" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const config = await getConfig();
  const pedido = {
    mostrarPrecos: config.mostrar_precos,
    pausado: config.pedidos_pausados,
    whatsapp: config.whatsapp,
    taxaEntrega: config.taxa_entrega,
    pedidoMinimo: config.pedido_minimo,
  };
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable} ${greatVibes.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={restauranteJsonLd()} />
        <CarrinhoProvider config={pedido}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BarraCarrinho />
          <BarraMobile />
        </CarrinhoProvider>
      </body>
    </html>
  );
}

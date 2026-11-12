import type { Metadata, Viewport } from "next";
import { Great_Vibes, Inter, Playfair_Display } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable} ${greatVibes.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

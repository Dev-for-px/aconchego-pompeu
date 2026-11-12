import { Globe, MapPin, ShoppingBag } from "lucide-react";
import type { ChaveRede } from "@/lib/redes";

// Ícones simples desenhados à mão (traço), no mesmo estilo dos ícones Lucide do site.
const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconeRede({ rede, size = 20 }: { rede: ChaveRede; size?: number }) {
  const svg = (children: React.ReactNode) => <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...P}>{children}</svg>;
  switch (rede) {
    case "instagram":
      return svg(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></>);
    case "facebook":
      return svg(<path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />);
    case "tiktok":
      return svg(<path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46M14 3c.5 2.5 2.3 4.2 5 4.5" />);
    case "youtube":
      return svg(<><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></>);
    case "google":
    case "tripadvisor":
      return <MapPin size={size} aria-hidden />;
    case "aiqfome":
    case "ifood":
      return <ShoppingBag size={size} aria-hidden />;
    default:
      return <Globe size={size} aria-hidden />;
  }
}

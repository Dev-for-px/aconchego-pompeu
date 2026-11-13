import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BarraMobile } from "@/components/BarraMobile";
import { BarraCarrinho } from "@/components/BarraCarrinho";
import { JsonLd } from "@/components/JsonLd";
import { AvisoSaida } from "@/components/AvisoSaida";
import { CarrinhoProvider } from "@/lib/carrinho";
import { getConfig } from "@/lib/dados";
import { restauranteJsonLd } from "@/lib/schema";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const config = await getConfig();
  const pedido = {
    mostrarPrecos: config.mostrar_precos,
    pausado: config.pedidos_pausados,
    whatsapp: config.whatsapp,
    taxaEntrega: config.taxa_entrega,
    pedidoMinimo: config.pedido_minimo,
  };
  return (
    <CarrinhoProvider config={pedido}>
      <JsonLd data={restauranteJsonLd(config.redes, config.horarios)} />
      <Header horarios={config.horarios} />
      <main className="flex-1">{children}</main>
      <Footer redes={config.redes} horarios={config.horarios} />
      <BarraCarrinho />
      <BarraMobile />
      <AvisoSaida config={config.saida} whatsapp={config.whatsapp} />
    </CarrinhoProvider>
  );
}

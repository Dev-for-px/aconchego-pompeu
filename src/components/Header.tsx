import { LogoTopo } from "./LogoTopo";
import { MenuMobile } from "./MenuMobile";
import { MenuTopo } from "./MenuTopo";
import type { Horarios } from "@/lib/horario";
import { MENU_PADRAO, type ItemMenu } from "@/lib/menu";

// Menu vem do painel (Ajustes › Menu do site); só os itens ligados aparecem.
export function Header({ horarios, menu = MENU_PADRAO }: { horarios: Horarios; menu?: ItemMenu[] }) {
  const links = menu.filter((m) => m.ativo);
  return (
    <header className="sticky top-0 z-40 bg-vinho-700 text-creme-50">
      <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <LogoTopo />
        <MenuTopo links={links} />
        <MenuMobile links={links} horarios={horarios} />
      </div>
    </header>
  );
}

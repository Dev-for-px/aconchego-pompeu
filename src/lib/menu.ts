// Menu do site (topo no computador e menu do celular) — editável no painel em Ajustes › Menu do site.
// Sem dependências de servidor: usado no site e no painel.
export type ItemMenu = { rotulo: string; href: string; ativo: boolean };

export const MENU_PADRAO: ItemMenu[] = [
  { rotulo: "Início", href: "/", ativo: true },
  { rotulo: "Almoço", href: "/almoco-hoje", ativo: true },
  { rotulo: "Pizzaria", href: "/cardapio", ativo: true },
  { rotulo: "Bebidas", href: "/bebidas", ativo: true },
  { rotulo: "Sobre nós", href: "/sobre", ativo: true },
  { rotulo: "Dúvidas", href: "/perguntas-frequentes", ativo: true },
  { rotulo: "Novidades", href: "/novidades", ativo: true },
  { rotulo: "Como chegar", href: "/contato", ativo: true },
];

/** Páginas do site que a equipe pode escolher ao montar o menu. */
export const PAGINAS_MENU = [
  ...MENU_PADRAO.map(({ rotulo, href }) => ({ rotulo, href })),
  { rotulo: "Fazer pedido", href: "/pedido" },
];

/** Menu salvo no banco, ou o padrão se ainda não foi configurado. */
export function lerMenu(salvo: unknown): ItemMenu[] {
  if (!Array.isArray(salvo) || salvo.length === 0) return MENU_PADRAO;
  const itens = salvo
    .filter((i): i is ItemMenu => !!i && typeof i.rotulo === "string" && typeof i.href === "string")
    .map((i) => ({ rotulo: i.rotulo.trim(), href: i.href.trim(), ativo: i.ativo !== false }))
    .filter((i) => i.rotulo && i.href);
  return itens.length ? itens : MENU_PADRAO;
}

/** Link aponta para fora do site? (abre em nova aba) */
export const linkExterno = (href: string) => /^https?:\/\//i.test(href);

/** Item do menu está ativo nesta página? */
export const menuAtivo = (href: string, caminho: string) => (href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(`${href}/`));

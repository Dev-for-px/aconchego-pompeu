"use client";
import { registrar } from "./rastreio";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ItemCarrinho = {
  chave: string;              // única por combinação (produto + sabores + adicionais + obs)
  produtoId: string | null;   // null para itens do almoço
  nome: string;               // ex.: "Pizza Calabresa" ou "Meia Calabresa / Meia Portuguesa"
  grupo: string;              // categoria ou "Almoço de 12/11"
  qtd: number;
  precoUnit: number | null;   // null = a confirmar
  adicionais: { nome: string; preco: number | null }[];
  obs: string;
};

export type ConfigPedido = {
  mostrarPrecos: boolean;
  pausado: boolean;
  whatsapp: string;
  taxaEntrega: number | null;
  pedidoMinimo: number | null;
};

type Ctx = {
  itens: ItemCarrinho[];
  config: ConfigPedido;
  adicionar: (item: Omit<ItemCarrinho, "chave">) => void;
  alterarQtd: (chave: string, qtd: number) => void;
  remover: (chave: string) => void;
  limpar: () => void;
  totalItens: number;
  subtotal: number | null;     // null se nenhum item tem preço visível
  temSemPreco: boolean;
  ultimoPedido: ItemCarrinho[];
  salvarUltimo: () => void;
  repetirUltimo: () => void;
  aviso: string | null;
};

const C = createContext<Ctx | null>(null);
const CHAVE = "aconchego:carrinho";
const CHAVE_ULTIMO = "aconchego:ultimo-pedido";

function ler(chave: string): ItemCarrinho[] {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as ItemCarrinho[]) : [];
  } catch {
    return [];
  }
}
function gravar(chave: string, itens: ItemCarrinho[]) {
  try {
    localStorage.setItem(chave, JSON.stringify(itens));
  } catch {}
}

export function precoItem(i: ItemCarrinho) {
  if (i.precoUnit == null) return null;
  return (i.precoUnit + i.adicionais.reduce((s, a) => s + (a.preco ?? 0), 0)) * i.qtd;
}

export function CarrinhoProvider({ config, children }: { config: ConfigPedido; children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [ultimoPedido, setUltimo] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    // Lê o que ficou salvo no aparelho (só existe no navegador).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItens(ler(CHAVE));
    setUltimo(ler(CHAVE_ULTIMO));
    setCarregado(true);
  }, []);
  useEffect(() => {
    if (carregado) gravar(CHAVE, itens);
  }, [itens, carregado]);
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  const adicionar = useCallback((novo: Omit<ItemCarrinho, "chave">) => {
    const chave = [novo.produtoId ?? novo.grupo, novo.nome, novo.adicionais.map((a) => a.nome).sort().join("+"), novo.obs.trim()].join("|");
    setItens((atual) => {
      const existe = atual.find((i) => i.chave === chave);
      if (existe) return atual.map((i) => (i.chave === chave ? { ...i, qtd: i.qtd + novo.qtd } : i));
      return [...atual, { ...novo, chave }];
    });
    setAviso(`${novo.nome} adicionado ao pedido`);
    registrar("add_carrinho", novo.nome.split(" – ")[0]);
  }, []);

  const valor = useMemo<Ctx>(() => {
    const visiveis = config.mostrarPrecos ? itens.map(precoItem) : itens.map(() => null);
    const comPreco = visiveis.filter((v): v is number => v != null);
    return {
      itens,
      config,
      adicionar,
      alterarQtd: (chave, qtd) => setItens((a) => (qtd <= 0 ? a.filter((i) => i.chave !== chave) : a.map((i) => (i.chave === chave ? { ...i, qtd } : i)))),
      remover: (chave) => setItens((a) => a.filter((i) => i.chave !== chave)),
      limpar: () => setItens([]),
      totalItens: itens.reduce((s, i) => s + i.qtd, 0),
      subtotal: comPreco.length ? comPreco.reduce((s, v) => s + v, 0) : null,
      temSemPreco: visiveis.some((v) => v == null),
      ultimoPedido,
      salvarUltimo: () => {
        gravar(CHAVE_ULTIMO, itens);
        setUltimo(itens);
      },
      repetirUltimo: () => {
        setItens(ultimoPedido);
        setAviso("Último pedido colocado no carrinho");
      },
      aviso,
    };
  }, [itens, config, adicionar, ultimoPedido, aviso]);

  return <C.Provider value={valor}>{children}</C.Provider>;
}

export function useCarrinho() {
  const c = useContext(C);
  if (!c) throw new Error("useCarrinho fora do CarrinhoProvider");
  return c;
}

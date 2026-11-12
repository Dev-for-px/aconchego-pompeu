import Image from "next/image";
import { NEGOCIO } from "@/lib/site";

// A logo oficial é intocável (ver Design System). Os arquivos ficam em /public/marca/.
// Enquanto não forem colocados lá, mostramos só o nome em texto simples.
const LOGO_DISPONIVEL = false;

export function Logo({ variante = "branca", altura = 48 }: { variante?: "branca" | "vinho"; altura?: number }) {
  if (LOGO_DISPONIVEL) {
    const src = variante === "branca" ? "/marca/logo-branca-sem-fundo.png" : "/marca/logo-vinho-sem-fundo.png";
    return <Image src={src} alt={NEGOCIO.nome} height={altura} width={altura * 2.4} priority className="h-auto w-auto" style={{ height: altura }} />;
  }
  return (
    <span className={`flex flex-col leading-tight ${variante === "branca" ? "text-creme-50" : "text-vinho-700"}`}>
      <span className="font-serif text-xl font-bold">Aconchego</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">Restaurante e Pizzaria</span>
    </span>
  );
}

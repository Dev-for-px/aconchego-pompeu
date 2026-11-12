import Image from "next/image";
import branca from "../../public/marca/logo-branca-sem-fundo.png";
import vinho from "../../public/marca/logo-vinho-sem-fundo.png";
import { NEGOCIO } from "@/lib/site";

// Logo oficial — intocável (Design System): só trocar o arquivo, nunca redesenhar.
// branca: sobre vinho/fotos escuras · vinho: sobre creme/fundos claros.
export function Logo({ variante = "branca", altura = 48, prioridade = false }: { variante?: "branca" | "vinho"; altura?: number; prioridade?: boolean }) {
  const src = variante === "branca" ? branca : vinho;
  return (
    <Image
      src={src}
      alt={NEGOCIO.nome}
      priority={prioridade}
      sizes={`${Math.round(altura * 2.46)}px`}
      style={{ height: altura, width: "auto" }}
    />
  );
}

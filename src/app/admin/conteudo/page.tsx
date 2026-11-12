import type { Metadata } from "next";
import { ConteudoAdmin } from "@/components/admin/ConteudoAdmin";

export const metadata: Metadata = { title: "Fotos e publicações" };

export default function PaginaConteudo() {
  return <ConteudoAdmin />;
}

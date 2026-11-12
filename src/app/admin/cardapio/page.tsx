import type { Metadata } from "next";
import { CardapioAdmin } from "@/components/admin/CardapioAdmin";

export const metadata: Metadata = { title: "Cardápio" };

export default function PaginaCardapio() {
  return <CardapioAdmin />;
}

import type { Metadata } from "next";
import { EquipeAdmin } from "@/components/admin/EquipeAdmin";

export const metadata: Metadata = { title: "Equipe" };

export default function PaginaEquipe() {
  return <EquipeAdmin />;
}

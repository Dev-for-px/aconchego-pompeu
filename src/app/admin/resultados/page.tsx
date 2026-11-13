import type { Metadata } from "next";
import { Resultados } from "@/components/admin/Resultados";

export const metadata: Metadata = { title: "Resultados" };

export default function PaginaResultados() {
  return <Resultados />;
}

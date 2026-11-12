import type { Metadata } from "next";
import { AjustesAdmin } from "@/components/admin/AjustesAdmin";

export const metadata: Metadata = { title: "Ajustes" };

export default function PaginaAjustes() {
  return <AjustesAdmin />;
}

import type { Metadata } from "next";
import { ClientesAdmin } from "@/components/admin/ClientesAdmin";

export const metadata: Metadata = { title: "Clientes" };

export default function PaginaClientes() {
  return <ClientesAdmin />;
}

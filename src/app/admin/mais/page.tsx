import type { Metadata } from "next";
import { Mais } from "@/components/admin/Mais";

export const metadata: Metadata = { title: "Mais" };

export default function PaginaMais() {
  return <Mais />;
}

import type { Metadata } from "next";
import { AlmocoAdmin } from "@/components/admin/AlmocoAdmin";

export const metadata: Metadata = { title: "Almoço do dia" };

export default function PaginaAlmoco() {
  return <AlmocoAdmin />;
}

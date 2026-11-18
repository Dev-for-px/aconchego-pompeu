import type { Metadata } from "next";
import { NEGOCIO, formatarTelefone } from "@/lib/site";

export const metadata: Metadata = { title: "Sem internet", robots: { index: false, follow: false } };

// Mostrada pelo app instalado quando o celular está sem internet.
export default function SemInternet() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-creme-50 px-6 text-center">
      <p className="font-serif text-3xl font-bold text-vinho-700">Sem internet no momento</p>
      <p className="mt-3 max-w-sm text-muted">Confira o Wi-Fi ou os dados móveis e tente de novo. Se preferir, ligue para o Aconchego: {formatarTelefone(NEGOCIO.telefone)}.</p>
      {/* Recarrega de verdade (testa a internet de novo), por isso <a> e não <Link> */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="mt-6 rounded-pill bg-vinho-700 px-6 py-3 font-semibold text-creme-50">Tentar de novo</a>
    </main>
  );
}

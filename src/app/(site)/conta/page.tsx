import type { Metadata } from "next";
import { ContaCliente } from "@/components/ContaCliente";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Entre na sua conta do Aconchego para pedir mais rápido.",
  robots: { index: false, follow: false },
};

export default function PaginaConta() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-4xl font-bold">Minha conta</h1>
      <p className="mt-2 text-muted">Opcional: com a conta, seus dados já vêm preenchidos em qualquer celular. Para pedir não precisa de conta.</p>
      <div className="mt-6"><ContaCliente /></div>
    </div>
  );
}

import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold">Página não encontrada</h1>
      <p className="mt-3 text-muted">Essa página não existe mais. Que tal ver o cardápio?</p>
      <Link href="/cardapio" className="mt-6 inline-block rounded-pill bg-vinho-700 px-6 py-3 font-semibold text-creme-50">Ver cardápio</Link>
    </div>
  );
}

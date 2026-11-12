import { supabaseConfigured } from "@/lib/supabase/env";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold text-red-700">
        Restaurante e Pizzaria Aconchego em Pompéu – MG
      </h1>
      <p className="text-neutral-600">Site em construção.</p>
      <p className="text-sm">
        Supabase:{" "}
        {supabaseConfigured ? (
          <span className="text-green-700">configurado</span>
        ) : (
          <span className="text-red-700">faltando variáveis no .env.local</span>
        )}
      </p>
    </main>
  );
}

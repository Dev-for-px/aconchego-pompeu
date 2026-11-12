import { cacheLife, cacheTag } from "next/cache";
import { llmsFullTxt } from "@/lib/llms";

async function gerar() {
  "use cache";
  cacheLife("minutes");
  cacheTag("cardapio", "almoco", "faq", "config");
  return llmsFullTxt();
}

export async function GET() {
  return new Response(await gerar(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

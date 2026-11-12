import { cacheLife } from "next/cache";
import { llmsTxt } from "@/lib/llms";

async function gerar() {
  "use cache";
  cacheLife("hours");
  return llmsTxt();
}

export async function GET() {
  return new Response(await gerar(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

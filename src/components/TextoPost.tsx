// Mostra o texto de uma publicação: parágrafos, "## Subtítulo" e listas com "- ".
export function TextoPost({ texto }: { texto: string }) {
  const blocos = texto.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-4 text-lg leading-relaxed text-ink">
      {blocos.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i} className="pt-4 text-2xl font-semibold">{b.slice(3)}</h2>;
        const linhas = b.split("\n");
        if (linhas.every((l) => /^[-•]\s/.test(l))) {
          return <ul key={i} className="list-disc space-y-1 pl-6">{linhas.map((l, j) => <li key={j}>{l.replace(/^[-•]\s/, "")}</li>)}</ul>;
        }
        return <p key={i}>{linhas.map((l, j) => <span key={j}>{j > 0 && <br />}{l}</span>)}</p>;
      })}
    </div>
  );
}

// Service worker do Aconchego (PWA). Simples de propósito:
// - páginas: sempre busca na internet (cardápio e preços sempre atualizados); sem internet, mostra a última versão ou /offline
// - arquivos fixos (/_next/static, ícones, fotos da galeria): guarda no aparelho para abrir mais rápido
// Nada do painel (/admin) nem do banco (Supabase) é guardado.
const VERSAO = "aconchego-v1.3.0";
const OFFLINE = "/offline";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll([OFFLINE, "/icon-192.png"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => { if (r.ok) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)); } return r; })
        .catch(() => caches.match(req).then((r) => r || caches.match(OFFLINE))),
    );
    return;
  }

  if (/^\/(_next\/static|galeria|marca)\//.test(url.pathname) || /\.(png|webp|jpg|svg|ico|woff2)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((achou) => achou || fetch(req).then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)); }
        return r;
      })),
    );
  }
});

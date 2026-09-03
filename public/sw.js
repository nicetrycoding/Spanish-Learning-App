// Minimal offline scaffold for Sendero.
//
// Scope: this caches pages the learner has already visited (lessons,
// vocabulary lists, grammar topics, dashboard) and static build assets, so
// they remain viewable offline — a "read cache", not a full offline-first
// architecture. Mutations (submitting an exercise, saving a word) still
// require connectivity; the harder problem of an offline write queue with
// background sync is intentionally out of scope for this pass, per the
// product spec's own guidance ("architect for it without compromising the
// core application" rather than force full offline support up front).
//
// Strategy:
//  - Next.js static assets (/_next/static/...): cache-first (immutable, hashed).
//  - Page navigations: network-first, falling back to the cached copy when
//    offline, so previously-visited lessons/vocab/grammar stay readable.

const CACHE_NAME = "sendero-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API routes or server actions.
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline"))),
    );
  }
});

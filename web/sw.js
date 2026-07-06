// Loose Leaf service worker
// Caches the app shell (HTML/CSS/JS/icons) so the app opens instantly and
// still loads (read-only, showing last-seen UI) with no connection.
// Journal data itself always goes straight to Supabase over the network —
// it is never cached here.

const CACHE_NAME = 'loose-leaf-shell-v1';
const SHELL_FILES = [
  './Loose_Leaf.html',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never intercept calls to Supabase or any cross-origin API — those must
  // always hit the network live (auth, journal entries, realtime).
  if (url.origin !== self.location.origin) {
    return;
  }

  if (req.method !== 'GET') {
    return;
  }

  // Network-first for the shell files, so a new deploy is picked up as soon
  // as there's a connection, but falls back to cache when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./Loose_Leaf.html')))
  );
});

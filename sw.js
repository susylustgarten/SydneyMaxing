// Sydney Maxing — service worker (offline app shell)
var CACHE = "symax-v1";
var SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./data.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  // never cache the AI call — always go to network
  if (req.url.indexOf("/api/") !== -1) return;
  if (req.method !== "GET") return;

  // cache-first for the app shell, network fallback
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});

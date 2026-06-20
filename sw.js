// sw.js — TripleTails v1.0 Service Worker
const CACHE_NAME = 'tripletails-v1';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'css/main.css',
  'css/animations.css',
  'css/critter-designs.css',
  'js/storage.js',
  'js/audio.js',
  'js/tiles.js',
  'js/board.js',
  'js/input.js',
  'js/matching.js',
  'js/generator.js',
  'js/ui.js',
  'js/main.js',
  'assets/critters/elephant.png',
  'assets/critters/giraffe.png',
  'assets/critters/hippo.png',
  'assets/critters/monkey.png',
  'assets/critters/panda.png',
  'assets/critters/parrot.png',
  'assets/critters/penguin.png',
  'assets/critters/pig.png',
  'assets/critters/rabbit.png',
  'assets/critters/snake.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Network-first for HTML, cache-first for others
      if (e.request.mode === 'navigate') {
        return fetch(e.request).catch(() => cached || caches.match('.'));
      }
      return cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

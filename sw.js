const CACHE_NAME = 'catholic-games-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './resources.html',
  './custom-vocabulary.html',
  './nav.css',
  './nav.js',
  './manifest.json',
  './icon-512.png',
  './ch-9-game-1-mind-clear.html',
  './ch-9-game-2-our-father.html',
  './ch-9-game-3-lectio-divina-journey.html',
  './ch-9-game-4-interactive-bible.html',
  './ch-9-game-5-holy_spirit_gifts-fruits.html',
  './ch-9-game-6-vocabulary-flash.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

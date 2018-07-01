self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('restaurant-reviews').then((cache) => {
      return cache.addAll([
        '/',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/js/current_year.js',
        '/js/index_controller.js',
        '/css/styles.css'
        ]);
    })
  );
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
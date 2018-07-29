const cacheVersion = 'restaurant-reviews';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheVersion).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/manifest.json',
        '/js/restaurants.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/js/current_year.js',
        '/js/restaurants_db.js',
        '/js/service_worker_register.js',
        '/css/styles.css',
        '/img/1_400.webp',
        '/img/1_600.webp',
        '/img/2_400.webp',
        '/img/2_600.webp',
        '/img/3_400.webp',
        '/img/3_600.webp',
        '/img/4_400.webp',
        '/img/4_600.webp',
        '/img/5_400.webp',
        '/img/5_600.webp',
        '/img/6_400.webp',
        '/img/6_600.webp',
        '/img/7_400.webp',
        '/img/7_600.webp',
        '/img/8_400.webp',
        '/img/8_600.webp',
        '/img/9_400.webp',
        '/img/9_600.webp',
        '/img/10_400.webp',
        '/img/10_600.webp',
        '/img/restaurant-16.png',
        '/img/restaurant-128.png',
        '/img/restaurant-256.png',
        '/img/restaurant-512.png'
        ]).then(() => {
          console.log('All files are cached successfully.');
          return self.skipWaiting();
        }).catch(err => {
          console.error('File cache failed with:', err)
        });
    })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [cacheVersion];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheVersion).then(cache => {
      return cache.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

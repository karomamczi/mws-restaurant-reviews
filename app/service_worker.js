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
        '/img/1_400.jpg',
        '/img/1_600.jpg',
        '/img/2_400.jpg',
        '/img/2_600.jpg',
        '/img/3_400.jpg',
        '/img/3_600.jpg',
        '/img/4_400.jpg',
        '/img/4_600.jpg',
        '/img/5_400.jpg',
        '/img/5_600.jpg',
        '/img/6_400.jpg',
        '/img/6_600.jpg',
        '/img/7_400.jpg',
        '/img/7_600.jpg',
        '/img/8_400.jpg',
        '/img/8_600.jpg',
        '/img/9_400.jpg',
        '/img/9_600.jpg',
        '/img/10_400.jpg',
        '/img/10_600.jpg',
        '/img/restaurant-16.png',
        '/img/restaurant-128.png',
        '/img/restaurant-256.png',
        '/img/restaurant-512.png'
        ]).then(() => {
          console.log('All files are cached successfully.');
          return self.skipWaiting();
        }).catch(err => {
          console.log('File cache failed with:', err)
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

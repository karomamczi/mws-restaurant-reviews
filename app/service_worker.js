self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('restaurant-reviews').then((cache) => {
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
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
        '/img/restaurant-16.png',
        '/img/restaurant-128.png',
        '/img/restaurant-256.png',
        '/img/restaurant-512.png'
        ]).then(() => {
          console.log('All files are cached successfully.');
          return self.skipWaiting();
        }).catch((err) => {
          console.log('File cache failed with:', err)
        });
    })
  );
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('restaurant-reviews').then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request, { mode: 'no-cors' }).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('restaurants').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/js/current_year.js',
        '/js/index_controller.js',
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
          console.log('Files cached successfully.');
          return self.skipWaiting();
        }).catch((err) => {
          console.log('File cache failed with:', err)
        });
    })
  );
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('restaurants').then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request).then((res) => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
    })

  );
});
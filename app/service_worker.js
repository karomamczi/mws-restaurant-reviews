const cacheVersion = 'restaurant-reviews';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheVersion).then((cache) => {
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

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key, i) => {
        if (key !== cacheVersion) {
          return caches.delete(keys[i]);
        }
      }));
    })
  )
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      requestBackend(event);
    })
  )
});

const requestBackend = (event) => {
  const url = event.request.clone();
  return fetch(url).then((response) => {
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }
    const responseToCache = response.clone();
    caches.open(cacheVersion).then((cache) => {
      cache.put(event.request, responseToCache);
    });
    return response;
  })
};
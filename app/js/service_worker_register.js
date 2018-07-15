if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service_worker.js')
      .then((registration) => console.log('ServiceWorker registration successful with scope: ', registration.scope))
      .catch((err) => console.log('ServiceWorker registration failed: ', err));
  });
} else {
  console.log('Service Worker is not supported in this. browser.');
}

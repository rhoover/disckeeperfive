
  //get the array of urls
  async function getServiceWorkerData() {
    const url = '/service-worker-data.json';
    //Using this cache mode, fetch() will behave as if no HTTP cache exists.
    const response = await fetch(url, {cache: 'no-store'});
    const files = await response.json();
    return files;
  };

  self.addEventListener('install', event => {

    const seedCache = async () => {
      getServiceWorkerData().then(files => {
        caches.open(cacheName).then(cache => {
          if (cache) {
            return cache.addAll(files);
          }
        });
      });
    };

    event.waitUntil(seedCache());
    
    self.skipWaiting();

  }); // end install event-listener

  self.addEventListener('activate', event => {

    async function removeOldCaches() {
      let names = await caches.keys();
      await Promise.all(names.map(name => {
        if (name != cacheName) {
          return caches.delete(name);
        }
      }));
    };

    event.waitUntil(removeOldCaches());
    
    // let her take over
    event.waitUntil(clients.claim());

  }); // end activate event-listener

  self.addEventListener('fetch', event => {

    const {request} = event;
    const url = new URL(request.url);

    // Only handle GET requests.
    if (request.method !== 'GET') return;

    // Don't handle non-http requests such as data: URIs.
    if (!url.protocol.startsWith('http')) return;

    // blacklist to keep cache clean
    if (url.origin === 'https://fonts.gstatic.com') return;
    if (url.origin === 'https://fonts.googleapis.com') return;
    if (url.origin === 'https://maps.googleapis.com') return;
    if (url.origin === 'https://maps.gstatic.com') return;
    if (url.origin === 'https://maps.google.com') return;
    if (url.pathname.startsWith('/mapfiles/')) return;

    async function getResponsePromise() {
      const cache = await caches.open(cacheName);

      // Try to find response in the cache.
      let response = await cache.match(request);

      if (!response) { // if there's nothing in a cache:
        if (request.cache === 'only-if-cached') return;

        // Try to fetch response from the network.
        // We will get a 404 error if not found.
        response = await fetch(request, {cache: 'no-store'});
        console.info('disckeeper got:', url.pathname, 'from network');

        // Cache the response since it wasn't in the cache
        cache.put(request, response.clone());
      } else { // then there ios something in a cache:
        console.info('disckeeper got:', url.pathname, 'from', cacheName);
      };

      return response;
    };

    event.respondWith(getResponsePromise());

  }); // end fetch event-listener

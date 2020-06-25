/**
 * @fileoverview Service worker for Anonace Web App.
 *
 * @see https://google.github.io/styleguide/javascriptguide.xml
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://developers.google.com/web/fundamentals/primers/service-workers/
 */


/**
 * @define {string} Defines cache key.
 * Will be replaced by Google Closure Compiler with "$(date +%Y%m%d-%H%M%S)".
 */
const CACHE_KEY = 'CACHE_KEY';


/**
 * Application base URL.
 * @const {string}
 */
const BASE_URL = 'https://anonace.com/';


self.addEventListener('message', (event) => {
  if ('version' == event.data.action) {
    event.ports[0].postMessage({'version': CACHE_KEY});
  }
});


self.addEventListener('fetch', event => {
  event.respondWith((() => {
    const requestClone = event.request.clone();
    const url = requestClone.url;

    if (~url.indexOf('nocache') || 0 != url.indexOf(BASE_URL)) {
      return fetch(requestClone);
    } else {
      return self.caches.match(event.request).then(response => {
        return response || fetch(requestClone).then(response => {
          const responseClone = response.clone();
          if ('GET' == requestClone.method) {
            self.caches.open(CACHE_KEY).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          return new Response;
        });
      });
    }
  })());
});


self.addEventListener('activate', event => {
  event.waitUntil(self.caches.keys().then(keys => {
    return Promise.all(keys.map(key => {
      if (CACHE_KEY !== key) {
        return self.caches.delete(key);
      }
    }));
  }));

  // Exporting for closure compiler.
  return self['clients']['claim']();
});

// self.addEventListener('install', (event) => {});


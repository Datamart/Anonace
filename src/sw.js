/**
 * @fileoverview Service worker for Anonace Web App.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://developers.google.com/web/fundamentals/primers/service-workers/
 */

/**
 * @define {string} Defines cache key.
 * Will be replaced by Google Closure Compiler with "$(date +%Y%m%d-%H%M%S)".
 */
var CACHE_KEY = 'CACHE_KEY';

/**
 * Application base URL.
 * @const {string}
 */
var BASE_URL = 'https://anonace.com/';


// self.addEventListener('install', function(event) {});


self.addEventListener('fetch', function(event) {
  event.respondWith((function() {
    var requestClone = event.request.clone();
    var url = requestClone.url;

    if (~url.indexOf('nocache') || 0 != url.indexOf(BASE_URL)) {
      return fetch(requestClone);
    } else {
      return self.caches.match(event.request).then(function(response) {
        return response || fetch(requestClone).then(function(response) {
          var responseClone = response.clone();
          if ('GET' == requestClone.method) {
            self.caches.open(CACHE_KEY).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(function() {
          return new Response();
        });
      });
    }
  })());
});


self.addEventListener('activate', function(event) {
  event.waitUntil(self.caches.keys().then(function(keys) {
    return Promise.all(keys.map(function(key) {
      if (CACHE_KEY !== key) {
        return self.caches.delete(key);
      }
    }));
  }));

  return self.clients.claim();
});

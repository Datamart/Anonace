/**
 * @fileoverview Service worker for Anonace Web App.
 *
 * @see https://google.github.io/styleguide/javascriptguide.xml
 * @see https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler
 * @see https://developers.google.com/web/fundamentals/primers/service-workers/
 */


/**
 * @define {string} Defines cache key.
 * Will be replaced by Google Closure Compiler with "$(date +%Y%m%d-%H%M%S)".
 */
const CACHE_KEY = 'CACHE_KEY';


/**
 * Fixing Closure Compiler 'JSC_INEXISTENT_PROPERTY' warning.
 * @const {!ServiceWorkerGlobalScope}
 */
const worker = /** @type {!ServiceWorkerGlobalScope} */ (self);


worker.addEventListener('message', (event) => {
  const /** string */ action = event.data['action'];
  const /** !Object */ response = {'action': action};

  if ('getVersion' == action) {
    response[action] = CACHE_KEY;
  } else if ('skipWaiting' == action) {
    // @see initUpdateFoundListener_
    worker.skipWaiting();
  }

  postMessage_(response);
});


/**
 * This is an event handler fired whenever a 'fetch' event occurs.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/onfetch
 */
worker.addEventListener('fetch', (event) => {
  event.respondWith(worker.caches.match(event.request).then((response) => {
    return response || fetchAndCache_(event.request);
  }));
});


/**
 * This is an event handler fired whenever an 'activate' event occurs.
 * This happens after installation, when the page to be controlled by the service worker refreshes.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/onactivate
 */
worker.addEventListener('activate', (event) => {
  postMessage_({'event': event.type});

  event.waitUntil(clearCache_());
  initUpdateFoundListener_();

  // Allows an active service worker to set itself as the controller for all clients within its scope.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
  return worker.clients.claim();
});


/**
 * Posts message to all clients.
 * @param {!Object} message The message to send.
 * @private
 */
const postMessage_ = (message) => {
  worker.clients.matchAll().then(clients => clients.forEach(client => {
    client.postMessage(message);
  }));
};


/**
 * @return {!Promise}
 * @private
 */
const clearCache_ = () => {
  return worker.caches.keys().then(keys => Promise.all(keys.map(key => {
    if (key !== CACHE_KEY) {
      return worker.caches.delete(key);
    }
  })));
};


/**
 * Initializes the 'updatefound' event listener.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/onupdatefound
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/installing
 * @private
 */
const initUpdateFoundListener_ = () => {
  worker.registration.addEventListener('updatefound', (event) => {
    const /** ?ServiceWorker */ newWorker = worker.registration.installing;

    newWorker.addEventListener('statechange', (event) => {
      if ('installed' == newWorker.state) {
        newWorker.postMessage({'action': 'skipWaiting'});
        postMessage_({'event': event.type, 'action': 'refresh'});
      }
    });

    postMessage_({'event': event.type});
  });
};


/**
 * @param {!Request} request The requested resource object.
 * @return {!Promise}
 * @private
 */
const fetchAndCache_ = (request) => {
  const /** !Promise */ result = fetch(request);

  if (isRequiestCacheble_(request)) {
    return result.then(response => worker.caches.open(CACHE_KEY).then(cache => {
      cache.put(request, response.clone());
      return response;
    }));
  }

  return result;
};


/**
 * @param {!Request} request The request to test.
 * @return {boolean} Return true if request is can be cached.
 * @private
 */
const isRequiestCacheble_ = (request) => {
  const /** string */ url = request.url;
  const /** boolean */ isGet = 'GET' == request.method;
  const /** boolean */ isSameOrigin = 0 == url.indexOf(worker.location.origin);
  const /** boolean */ hasNoCacheFlag = 0 > url.indexOf('nocache');

  return isGet && isSameOrigin && !hasNoCacheFlag;
};

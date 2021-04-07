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
 * @see https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
 */
 const OFFLINE_CACHE = [
  '/', '/favicon.ico', '/manifest.json', '/robots.txt', '/sitemap.xml',
  '/?utm_source=web_app_manifest',
  '/disclaimer/', '/offline/', '/privacy-policy/', 
  '/technical-information/', '/terms-of-service/',
  '/images/apple-touch-icon.png',
  '/images/favicon-32x32.png', '/images/favicon-16x16.png',
  '/images/feature-graphic-1024x500.jpg',
  '/images/logo-144x144.png', '/images/logo-192x192.png',
  '/images/logo-256x256.png', '/images/logo-384x384.png',
  '/images/logo-512x512-maskable.png',
  '/images/logo-512x512.png', '/images/logo.svg',
 ];

/**
 * Fixing Closure Compiler 'JSC_INEXISTENT_PROPERTY' warning.
 * @const {!ServiceWorkerGlobalScope}
 */
const worker = /** @type {!ServiceWorkerGlobalScope} */ (self);


worker.addEventListener('install', (event) => {
  event.waitUntil(
    worker.caches.open(CACHE_KEY)
      .then((cache) => {
        cache.addAll(OFFLINE_CACHE.map((url) => {
          return new Request(url, {mode: 'no-cors'});
        }))
        .catch((ex) => console.log('Could not pre-cache resource:', ex));
      })
      .catch((ex) => console.log('Could not pre-cache resources:', ex)));
});


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
  worker.clients.matchAll().then((clients) => clients.forEach((client) => {
    client.postMessage(message);
  }));
};


/**
 * @return {!Promise}
 * @private
 */
const clearCache_ = () => {
  return worker.caches.keys().then((keys) => Promise.all(keys.map((key) => {
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
const fetchAndCache_ = async (request) => {
  // let /** !Promise */ result = fetch(request);
  const isJsonpRequest = isJsonpRequest_(request);
  const JSONP_CACHE_KEY = isJsonpRequest ? getJsonpCacheKey_(request) : '';

  let response;
  try {
    response = await fetch(request);
    if (isRequiestCacheble_(request) || isJsonpRequest) {
      const cache = await worker.caches.open(CACHE_KEY);
      if (JSONP_CACHE_KEY) {
        console.log('request:', request);
        console.log('response:', response);
        if (response.ok) {
          const text = await response.text();
          const body = (text || '').replace(/jsonp_\w+\(/, 'jsonp_cb(');
          const blob = new Blob([body], {type : 'application/json'});
          console.log(JSONP_CACHE_KEY, text, body, blob);
          cache.put(JSONP_CACHE_KEY, new Response(blob, {
            status: 304,  // response.status,
            statusText: 'Not Modified',  // response.statusText,
            headers: response.headers
          }));
        }
      } else {
        cache.put(request, response.clone());
      }
    }
  } catch(ex) {
    console.log('Could not fetch request:', ex);
    const cache = await worker.caches.open(CACHE_KEY);
    if (isJsonpRequest) {
      // response = await cache.match(JSONP_CACHE_KEY)
      // if (response) {
      //   // Updating the name of the callback function in the last cached response.
      //   const cb = request.url.split('&jsonp=').pop().split('&')[0];
      //   const text = await response.text();
      //   const body = (text || '').replace(/jsonp_cb\(/, cb + '(');
      //   const blob = new Blob([body], {type : 'application/json'});
      //   response = new Response(blob, {
      //     status: response.status,
      //     statusText: response.statusText,
      //     headers: response.headers
      //   });
      // } else {
        response = await getEmptyJsonpResponse_(request);
      //}
    } else {
      response = await cache.match('/offline/');
    }
    console.log('Offline response:', response);
  }

  return response;
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
  const /** boolean */ hasNoCacheFlag = -1 != url.indexOf('nocache');

  return isGet && isSameOrigin && !hasNoCacheFlag;
};


/**
 * @param {!Request} request The request to test.
 * @return {boolean} Return true if request is JSONP request.
 * @private
 */
const isJsonpRequest_ = (request) => {
  return -1 != request.url.indexOf('&jsonp=');
};


/**
 * @param {!Request} request The request to get calback function name.
 * @return {!Promise} Return empty JSONP response.
 * @private
 */
const getEmptyJsonpResponse_ = (request) => {
  // https://script.google.com/exec?action=search&jsonp=cb123&params=
  const cb = request.url.split('&jsonp=').pop().split('&')[0];
  return fetch(new Request('data:text/javascript,' + cb + '([])'));
};


/**
 * @param {!Request} request The request to get calback function name.
 * @return {string} Return JSONP cache key.
 * @private
 */
const getJsonpCacheKey_ = (request) => {
  // https://script.google.com/exec
  //   ?action=search
  //   &source=twitter
  //   &query=%40vpodk
  //   &count=5
  //   &jsonp=jsonp_490978746
  //
  // https://script.google.com/exec
  //   ?action=proxy
  //   &query=https%3A%2F%2Fmedium.com%2Fswlh%2Fafefe8c7c6c5%3F
  //   &jsonp=jsonp_714561546
  //
  // https://script.google.com/exec
  //   ?action=typeahead
  //   &source=twitter
  //   &query=komito%20analytics
  //   &count=10
  //   &jsonp=jsonp_601335910
  const map = {};
  const query = request.url.split('?').pop();
  const pairs = query.split('&');
  let index = pairs.length >>> 0;
  while (index--) {
    const pair = pairs[index].split('=');
    const key = pair[0];
    if (key) map[key] = decodeURIComponent(pair[1]);
  }

  const keys = [map['action'], hash(map['query'])];
  map['source'] && keys.push(map['source']);
  return 'offline-' + keys.join('-') + '.json';
};


/**
 * Converts <code>str</code> to hashed string.
 * @param {string} str The input string.
 * @return {string} Returns hashed string.
 * @see https://github.com/Datamart/Glize/blob/master/src/utils/string.js
 */
const hash =(str) => {
  const length = str.length;
  let result = 0;
  let j = 0;

  for (let i = 0; i < length;) {
    result ^= str.charCodeAt(i++) << j;
    j += 8;
    j %= 24;
  }

  return result.toString(36).toUpperCase();
};

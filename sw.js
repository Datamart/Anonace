function f(){this.g=!1;this.c=null;this.b=void 0;this.a=1;this.l=this.h=0;this.f=null}function l(a){if(a.g)throw new TypeError("Generator is already running");a.g=!0}f.prototype.i=function(a){this.b=a};function q(a,b){a.f={j:b,m:!0};a.a=a.h||a.l}f.prototype.return=function(a){this.f={return:a};this.a=this.l};function u(a,b,d){a.a=d;return{value:b}}function w(a){this.a=new f;this.b=a}
function x(a,b){l(a.a);var d=a.a.c;if(d)return y(a,"return"in d?d["return"]:function(h){return{value:h,done:!0}},b,a.a.return);a.a.return(b);return z(a)}function y(a,b,d,h){try{var e=b.call(a.a.c,d);if(!(e instanceof Object))throw new TypeError("Iterator result "+e+" is not an object");if(!e.done)return a.a.g=!1,e;var m=e.value}catch(n){return a.a.c=null,q(a.a,n),z(a)}a.a.c=null;h.call(a.a,m);return z(a)}
function z(a){for(;a.a.a;)try{var b=a.b(a.a);if(b)return a.a.g=!1,{value:b.value,done:!1}}catch(d){a.a.b=void 0,q(a.a,d)}a.a.g=!1;if(a.a.f){b=a.a.f;a.a.f=null;if(b.m)throw b.j;return{value:b.return,done:!0}}return{value:void 0,done:!0}}
function I(a){this.next=function(b){l(a.a);a.a.c?b=y(a,a.a.c.next,b,a.a.i):(a.a.i(b),b=z(a));return b};this.throw=function(b){l(a.a);a.a.c?b=y(a,a.a.c["throw"],b,a.a.i):(q(a.a,b),b=z(a));return b};this.return=function(b){return x(a,b)};this[Symbol.iterator]=function(){return this}}function J(a){function b(h){return a.next(h)}function d(h){return a.throw(h)}return new Promise(function(h,e){function m(n){n.done?h(n.value):Promise.resolve(n.value).then(b,d).then(m,e)}m(a.next())})}
var K="/ /favicon.ico /manifest.json /robots.txt /sitemap.xml /?utm_source=web_app_manifest /disclaimer/ /offline/ /privacy-policy/ /technical-information/ /terms-of-service/ /images/apple-touch-icon.png /images/favicon-32x32.png /images/favicon-16x16.png /images/feature-graphic-1024x500.jpg /images/logo-144x144.png /images/logo-192x192.png /images/logo-256x256.png /images/logo-384x384.png /images/logo-512x512-maskable.png /images/logo-512x512.png /images/logo.svg".split(" "),L=self;
L.addEventListener("install",function(a){a.waitUntil(L.caches.open("20220727-035920").then(function(b){b.addAll(K.map(function(d){return new Request(d,{mode:"no-cors"})})).catch(function(d){return console.log("Could not pre-cache resource:",d)})}).catch(function(b){return console.log("Could not pre-cache resources:",b)}))});L.addEventListener("message",function(a){a=a.data.action;var b={action:a};"getVersion"==a?b[a]="20220727-035920":"skipWaiting"==a&&L.skipWaiting();M(b)});
L.addEventListener("fetch",function(a){a.respondWith(L.caches.match(a.request).then(function(b){return b||N(a.request)}))});L.addEventListener("activate",function(a){M({event:a.type});a.waitUntil(O());P();return L.clients.claim()});function M(a){L.clients.matchAll().then(function(b){return b.forEach(function(d){d.postMessage(a)})})}function O(){return L.caches.keys().then(function(a){return Promise.all(a.map(function(b){if("20220727-035920"!==b)return L.caches.delete(b)}))})}
function P(){L.registration.addEventListener("updatefound",function(a){var b=L.registration.installing;b.addEventListener("statechange",function(d){"installed"==b.state&&(b.postMessage({action:"skipWaiting"}),M({event:d.type,action:"refresh"}))});M({event:a.type})})}
function N(a){var b,d,h,e,m,n,B,C,D,A,E,r,F,G;return J(new I(new w(function(c){switch(c.a){case 1:b=-1!=a.url.indexOf("&jsonp=");d={mode:b?"cors":"no-cors",credentials:b?"omit":"include"};if(b){var g={};for(var k=a.url.split("?").pop().split("&"),v=k.length>>>0;v--;){var t=k[v].split("="),p=t[0];p&&(g[p]=decodeURIComponent(t[1]))}k=g.query;v=k.length;for(var H=p=t=0;H<v;)t^=k.charCodeAt(H++)<<p,p+=8,p%=24;k=[g.action,t.toString(36).toUpperCase()];g.source&&k.push(g.source);g="offline-"+k.join("-")+
".json"}else g="";h=g;c.h=2;return u(c,fetch(a,d),4);case 4:e=c.b;k=a.url;g=0==k.indexOf(L.location.origin);k=-1!=k.indexOf("nocache");if(("GET"!=a.method||!g||k)&&!b){c.a=5;break}return u(c,L.caches.open("20220727-035920"),6);case 6:m=c.b;if(!h){m.put(a,e.clone());c.a=5;break}if(!e.ok){c.a=5;break}n=e.clone();return u(c,n.text(),9);case 9:B=c.b,C=(B||"").replace(/jsonp_\w+\(/,"jsonp_cb("),m.put(h,new Response(C,{status:200,statusText:"Ok",headers:{"content-type":"text/javascript"}}));case 5:c.a=
3;c.h=0;break;case 2:return c.h=0,g=c.f.j,c.f=null,D=g,console.log("Could not fetch request:",D),u(c,L.caches.open("20220727-035920"),10);case 10:return A=c.b,b?u(c,A.match(h),14):u(c,A.match("/offline/"),13);case 13:e=c.b;c.a=12;break;case 14:if(e=c.b)return E=a.url.split("&jsonp=").pop().split("&")[0],r=e.clone(),u(c,r.text(),18);g=a.url.split("&jsonp=").pop().split("&")[0];g=fetch(new Request("data:text/javascript,"+g+"([])"));return u(c,g,17);case 17:e=c.b;c.a=12;break;case 18:F=c.b,G=(F||"").replace(/jsonp_cb\(/,
E+"("),e=new Response(G,{status:r.status,statusText:r.statusText,headers:r.headers});case 12:console.log("Offline response:",e);case 3:return c.return(e)}})))};

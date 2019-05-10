
Node.prototype.getSVGDocument = function() {};
Element.prototype.getSVGDocument = function() {};
Element.prototype.onselectstart = function() {};

XMLHttpRequest.prototype.sendAsBinary = function() {};

window.VBArray = function() {};
window.ActiveXObject = function() {};
window.DOMParser = function() {};
window.XMLSerializer = function() {};
window.FormData = function() {};
window.FileReader = function() {};

var attachEvent = window.attachEvent;
var addEventListener = window.addEventListener;
var JSON = window.JSON;
var console = window.console;
var event = window.event;

/**
 * The Clients interface provides access to Client objects.
 * Access it via 'self.clients' within a service worker.

 * @see https://developer.mozilla.org/en-US/docs/Web/API/Clients
 */
self.clients = {
    claim: function() {},
    get: function() {},
    matchAll: function() {},
    openWindow: function() {}
};

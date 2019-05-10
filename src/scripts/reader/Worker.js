/**
 * @fileoverview Simple implementation of web worker service.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 */



/**
 * @constructor
 * @see chrome://serviceworker-internals/
 */
reader.Worker = function() {
  /** @const {string} */ var SERVICE_WORKER = '/sw.js';
  /** @const {string} */ var INSTALL_BUTTON = 'pwa-install';

  /**
   * Initializes service worker.
   * @private
   */
  function initServiceWorker_() {
    if ('serviceWorker' in dom.device) {
      dom.device['serviceWorker']['register'](SERVICE_WORKER);
    }
  }

  /**
   * @private
   */
  function initInstallPrompt_() {
    dom.events.addEventListener(
        dom.context, 'beforeinstallprompt', function(event) {
          event.preventDefault();
          installPromptEvent_ = event;
          initInstallButton_(dom.getElementById(INSTALL_BUTTON));
        });

    // dom.events.addEventListener(
    //     dom.context, 'appinstalled', function() {
    //       console.log('onAppInstalled');
    //     });
  }

  /**
   * @param {Element} button The install button container.
   * @private
   */
  function initInstallButton_(button) {
    if (button) {
      dom.css.addClass(button, 'visible');
      dom.events.addEventListener(button, dom.events.TYPE.CLICK, function() {
        dom.css.removeClass(button, 'visible');
        installPromptEvent_.prompt();
        installPromptEvent_['userChoice'].then(function(choice) {
          // console.log('User ' + choice.outcome + ' the A2HS prompt.');
          installPromptEvent_ = dom.NULL;
        });
      });
    }
  }

  /**
   * Initializes service worker.
   * @private
   */
  function init_() {
    if ('https:' == location.protocol) {
      initServiceWorker_();
      initInstallPrompt_();
    }
  }

  /**
   * @type {Event}
   * @private
   */
  var installPromptEvent_;

  // Initializing service worker.
  init_();
};

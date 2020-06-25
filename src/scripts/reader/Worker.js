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
  const /** string */ SERVICE_WORKER = '/sw.js';
  const /** string */ INSTALL_PWA = 'pwa-install';

  /**
   * Initializes service worker.
   * @private
   */
  const initServiceWorker_ = () => {
    if ('serviceWorker' in dom.device) {
      dom.device['serviceWorker']['register'](SERVICE_WORKER);
    }
  };

  /**
   * @private
   */
  const initInstallPrompt_ = () => {
    dom.events.addEventListener(
        dom.context, 'beforeinstallprompt', (event) => {
          event.preventDefault();
          installPromptEvent_ = event;
          initInstallButton_(dom.getElementById(INSTALL_PWA));
        });

    // dom.events.addEventListener(
    //     dom.context, 'appinstalled', function() {
    //       console.log('onAppInstalled');
    //     });
  };

  /**
   * @param {?Element} element The install button container.
   * @private
   */
  const initInstallButton_ = (element) => {
    if (element) {
      dom.css.addClass(element, 'visible');
      dom.events.addEventListener(element, dom.events.TYPE.CLICK, () => {
        dom.css.removeClass(element, 'visible');
        installPromptEvent_.prompt();
        installPromptEvent_['userChoice'].then((choice) => {
          // console.log('User ' + choice.outcome + ' the A2HS prompt.');
          installPromptEvent_ = dom.NULL;
        });
      });
    }
  };

  /**
   * Initializes service worker.
   * @private
   */
  const init_ = () => {
    if ('https:' == location.protocol) {
      initServiceWorker_();
      initInstallPrompt_();
    }
  };

  /**
   * @private ?Event
   */
  let installPromptEvent_;

  // Initializing service worker.
  init_();
};

/**
 * @fileoverview Simple implementation of web worker service.
 *
 * @see https://google.github.io/styleguide/javascriptguide.xml
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://github.com/Datamart/Glize
 */

import {getContext, getDocument} from '../glize/dom/index.js';



/**
 * @constructor
 * @see chrome://serviceworker-internals/
 */
export const Worker = function() {
  const /** string */ SERVICE_WORKER = '/sw.js';
  const /** string */ INSTALL_PWA = 'pwa-install';

  const ctx = getContext();
  const doc = getDocument();
  const nav = ctx.navigator;

  /**
   * Initializes service worker.
   * @private
   */
  const initServiceWorker_ = () => {
    if ('serviceWorker' in nav) {
      nav['serviceWorker']['register'](SERVICE_WORKER);
    }
  };

  /**
   * @private
   */
  const initInstallPrompt_ = () => {
    ctx.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPromptEvent_ = event;
      initInstallButton_(doc.getElementById(INSTALL_PWA));
    });

    // ctx.addEventListener('appinstalled', function() {
    //   console.log('onAppInstalled');
    // });
  };

  /**
   * @param {?Element} element The install button container.
   * @private
   */
  const initInstallButton_ = (element) => {
    if (element) {
      element.classList.add('visible');
      element.addEventListener('click', () => {
        element.classList.remove('visible');
        installPromptEvent_.prompt();
        installPromptEvent_['userChoice'].then((choice) => {
          // console.log('User ' + choice.outcome + ' the A2HS prompt.');
          installPromptEvent_ = null;
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

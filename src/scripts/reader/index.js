/**
 * @fileoverview Defines <code>reader</code> namespace.
 *
 * @see https://google.github.io/styleguide/javascriptguide.xml
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://github.com/Datamart/Glize
 */

import * as glize from 'glize';

import {Parser} from './parser.js';
import {Api} from './api.js';
import {MediaExtractor} from './extractor.js';
import {DataStorage} from './storage.js';
import {Worker} from './worker.js';
import {Twitter} from './twitter.js';
import {Reddit} from './reddit.js';


/**
 * Indicates a constant that can be overridden by the compiler at compile-time.
 * @define {boolean}
 */
const ENABLE_DEBUG = true;


/**
 * @extends {Parser}
 * @constructor
 */
const App = function() {
  Parser.call(this);

  const dom = glize.dom;
  const ctx = /** @type {!Window} */ (dom.getRootContext());
  const doc = dom.getDocument();

  function drawContent_() {
    var data = {};

    for (var name in sources_) {
      if (content_[name]) {
        var result = sources_[name].parse(content_[name], extractor_);
        for (var key in result) {
          data[key] = data[key] || [];
          data[key] = data[key].concat(result[key]);
        }
      }
    }

    var keys = Object.keys(data);
    var length = keys.length;
    keys.sort();

    var node = dom.getElement('content');
    var html = '';

    if (length) {
      for (; length--;) {
        html += data[keys[length]].join('');
      }
    } else {
      html = dom.getElement('no-result-template').textContent;
    }

    node.innerHTML = html;
    initLinkEvents_(node);

    content_ = {};
    api.cacheEnabled = true;
  }

  function initLinkEvents_(node) {
    node.onclick = function(e) {
      var target = e.target;
      if (target) {
        var link = target.getAttribute('data-link');
        link && ctx.open(link, '_blank');
      }
    };
  }

  function initForm_() {
    var form = doc.forms['interests'];
    var input = form.elements['q'];

    dom.addEvent(form, 'submit', function() {
      interests_.update(input.value.split(','), true);
      input.value = '';
      initInterestsList_();
      initContent_();
    });

    initAutoComplete_(input);
  }

  function initAutoComplete_(input) {
    var dataList = dom.makeNode('datalist');
    var webView = ~navigator.userAgent.indexOf('; wv)');
    var supported = 'list' in input && !webView &&
        Boolean(dataList && ctx['HTMLDataListElement']);

    if (supported) {
      dom.appendNode(input.parentNode, dataList).id = 'typeahead';
      input.setAttribute('list', dataList.id);

      
      dom.addEvent(input, 'input', glize.utils.events.debounce(() => {
        /** @type {string} */ var value = input.value.trim();
        dataList.options.length = 0;

        2 < value.length && api.typeahead(value, 10, function(data) {
          /** @type {number} */ var length = data && data.length;
          dataList.options.length = 0;

          if (length) {
            for (; length--;) {
              /** @type {!Object} */ var item = data[length];
              /** @type {string} */ var value = item['screen_name'] ?
                  ('@' + item['screen_name']) : item['hashtag'];
              if (value) {
                dom.appendNode(dataList, dom.makeNode('OPTION')).value = value;
              }
            }
          }
        });
      }));
    }
  }

  function initSettingList_(key) {
    var list = settings_[key].get();
    var keys = Object.keys(list);
    var length = keys.length;
    var html = '';
    var node = dom.getElement(key + '-list');

    if (length) {
      keys.sort();
      keys.reverse();

      for (; length--;) {
        var interest = keys[length];
        var enabled = list[interest];
        var value = {'checked': enabled ? 'checked' : ''};
        value[key] = escape_(interest);
        html += self_.parseTemplate(key + '-item', value);
      }

      node.innerHTML = html;
      initSettingRemoveItem_(key, node);
      initSettingEnableItem_(key, node);
    } else {
      node.innerHTML = html;
      dom.getElement('content').innerHTML =
          dom.getElement('no-interest-template').textContent;
      dom.getElement('sidebar').classList.add('open');
    }
  }

  function initSettingRemoveItem_(key, node) {
    var links = dom.getElementsByTag(node, 'a');
    var length = links.length;
    var link;

    for (; length--;) {
      link = links[length];
      dom.addEvent(link, 'click', function(e) {
        if (confirm('Are you sure you want to remove this ' + key + '?')) {
          var link = e.target;
          var value = link.getAttribute('data-value');
          if (value) {
            settings_[key].remove([value]);
            initSettingList_(key);
            initContent_();
          }
        }
        e.preventDefault();
      });
    }
  }

  const initSettingEnableItem_ = (key, node) => {
    const inputs = dom.getElementsByTag(node, 'input');
    let length = inputs.length;

    for (; length--;) {
      inputs[length].onclick = (e) => {
        setTimeout(() => { // Do not block custom checkbox rendering.
          const input = e.target;
          const value = input.value;
          if (value) {
            settings_[key].update([value], input.checked);
            initSettingList_(key);
            initContent_();
          }
        }, 0);
      };
    }
  };

  function initInterestsList_() {
    initSettingList_('interest');
  }

  function initUserConfig_() {
    /** @type {!Object.<string, number>} */ var data = config_.get();
    /** @type {!Object.<string, !Array>} */ var keys = {
      'interests-count': ['change', initContent_],
      'dark-mode': ['click', initDarkMode_]
    };

    function addEvent(input, item) {
      if (input) {
        var event = item[0];
        var handler = item[1];
        var value = data[input.id];

        if (value) {
          if ('checkbox' == input.type) {
            input.checked = !!value;
          } else {
            input.value = value;
          }
        }

        dom.addEvent(input, event, function() {
          value = 'checkbox' == input.type ? +input.checked : input.value;
          data[input.id] = value;
          config_.set(data);
          handler();
        });
      }
    }

    for (var key in keys) {
      addEvent(dom.getElement(key), keys[key]);
    }
  }

  function initSourcesList_() {
    /** @type {string} */ var key = 'source';
    /** @type {!Object.<string, number>} */ var list = settings_[key].get();

    if (Object.keys(list).length != Object.keys(sources_).length) {
      settings_[key].update(Object.keys(sources_), true);
    }

    initSettingList_(key);
  }

  function initContent_() {
    var interests = interests_.get();
    var names = [];
    var hashtags = [];
    var keywords = [];
    var keys = Object.keys(interests);
    var length = keys.length;

    if (length) {
      setStaticContent_('loading');
      for (; length--;) {
        var interest = keys[length];
        var enabled = interests[interest];
        if (enabled) {
          var firstChar = interest.charAt(0);

          if ('@' == firstChar || '+' == firstChar) {
            names.push(interest);
          } else if ('#' == firstChar) {
            hashtags.push(interest);
          } else {
            keywords.push(interest);
          }
        }
      }
    }

    keys.length && initLoader_(names, hashtags, keywords);
  }

  function initLoader_(names, hashtags, keywords) {
    count_ = names.length + +(hashtags.length > 0) + +(keywords.length > 0);
    var count = config_.get()['interests-count'] || 10;

    if (count_) {
      load_(hashtags.join(','), count * hashtags.length);
      load_(keywords.join(','), count * keywords.length);
      var length = names.length;
      for (; length--;) {
        load_(names[length], count);
      }
    } else {
      setStaticContent_('no-selected-interest');
    }
  }

  function load_(query, count) {
    /** @type {string} */ var key = 'source';
    /** @type {!Object.<string, !Parser>} */ var enabled = {};
    /** @type {!Object.<string, number>} */ var list = settings_[key].get();

    for (key in list) {
      if (list[key]) {
        enabled[key] = sources_[key];
      }
    }

    if (Object.keys(enabled).length) {
      if (query.length) {
        api.search(enabled, query, count, function(data) {
          for (/** @type {string} */ var source in data) {
            content_[source] = (content_[source] || []).concat(data[source]);
          }

          --count_ || drawContent_();
        });
      }
    } else {
      setStaticContent_('no-selected-source');
    }
  }

  function setStaticContent_(key) {
    dom.getElement('content').innerHTML =
        dom.getElement(key + '-template').textContent;
  }

  function escape_(str) {
    return str.replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/\"/g, '&quot;').
        replace(/\'/g, '&#39;');
  }

  function initHeaderControls_() {
    let /** ?Element */ node = dom.getElement('update-button');
    node && dom.addEvent(node, 'click', function(e) {
      e.preventDefault();
      api.cacheEnabled = false;
      initContent_();
    });

    /** @type {!Object.<string, number>} */ var data = config_.get();
    /** @type {?Element} */ var sidebar = dom.getElement('sidebar');

    node = dom.getElement('settings-button');
    node && dom.addEvent(node, 'click', function(e) {
      e.preventDefault();
      sidebar.classList.toggle('open');
      data[sidebar.id] = +sidebar.classList.contains('open');
      config_.set(data);
    });

    +data[sidebar.id] && sidebar.classList.add('open');
  }

  const initDarkMode_ = () => {
    const /** !Object<string, number> */ data = config_.get();

    if (!('dark-mode' in data) && ctx.matchMedia) {
      const /** string */ query = '(prefers-color-scheme: dark)';
      data['dark-mode'] = +ctx.matchMedia(query).matches;
      config_.set(data);
    }

    if (+data['dark-mode']) {
      doc.body.classList.add('dark');
    } else {
      doc.body.classList.remove('dark');
    }
  };

  const initPlatform_ = () => {
    const /** string */ userAgent = navigator.userAgent;

    // iOS pre 13
    const /** boolean */ iOS = /iPad|iPhone|iPod/.test(userAgent) &&
                               !ctx['MSStream'];
    // iPad OS 13
    const /** boolean */ iPadOS = navigator.platform === 'MacIntel' &&
    navigator.maxTouchPoints > 1;

    if (iOS || iPadOS) {
      doc.body.classList.add('ios');
    } else {
      doc.body.classList.add('md');
    }
  };

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
  */
  const initNetworkStatus_ = () => {
    const handler = () => {
      const cl = doc.body.classList;
      navigator.onLine ?  cl.remove('offline') : cl.add('offline');
    };
    dom.addEvent(ctx, 'online', handler);
    dom.addEvent(ctx, 'offline', handler);
    handler();
  };

  const init_ = () => {
    initPlatform_();
    initDarkMode_();
    initForm_();
    initHeaderControls_();
    initInterestsList_();
    initSourcesList_();
    initUserConfig_();
    initContent_();
    initNetworkStatus_();
    doc.body.classList.remove('no-js');

    // document.referrer.indexOf('android-app://') == 0 // Android TWA
  };

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @private {!App}
   */
  const self_ = this;

  /**
   * @private {!Object}
   */
  let content_ = {};

  /**
   * @private {number}
   */
  let count_ = 0;

  const api = new Api();
  const interests_ = new DataStorage('interests');
  const config_ = new DataStorage('config');
  const extractor_ = new MediaExtractor(api);
  const worker_ = new Worker();

  /**
   * @private {!Object<string, !DataStorage>}
   */
  const settings_ = {
    'interest': interests_,
    'source': new DataStorage('sources')
  };

  /**
   * @private {!Object<string, !Parser>}
   */
  const sources_ = {
    'twitter': new Twitter,
    'reddit': new Reddit
  };

  init_();
};


if (ENABLE_DEBUG) {
  setTimeout(() => { new App; }, 99);
} else {
  new App;
}

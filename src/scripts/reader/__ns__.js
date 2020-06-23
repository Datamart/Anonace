/**
 * @fileoverview Defines <code>reader</code> namespace.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 */


/**
 * Defines <code>reader</code> namespace.
 * @namespace
 */
var reader = {};



/**
 * @extends {reader.Parser}
 * @constructor
 */
reader.App = function() {
  reader.Parser.call(this);

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

    var keys = util.Object.keys(data);
    var length = keys.length;
    keys.sort();

    var node = dom.getElementById('content');
    var html = '';

    if (length) {
      for (; length--;) {
        html += data[keys[length]].join('');
      }
    } else {
      html = dom.getElementById('no-result-template').textContent;
    }

    node.innerHTML = html;
    initLinkEvents_(node);

    content_ = {};
    api.cacheEnabled = true;
  }

  function initLinkEvents_(node) {
    node.onclick = function(e) {
      var target = dom.events.getEventTarget(e);
      if (target) {
        var link = target.getAttribute('data-link');
        link && dom.context.open(link, '_blank');
      }
    };

    // Google+ API is deprecated
    //
    // Google+ link fix:
    // var links = util.Array.toArray(
    //     dom.getElementsByClassName(node, 'ot-hashtag')).concat(
    //     util.Array.toArray(dom.getElementsByClassName(node, 'ot-anchor')));
    // var length = links.length;

    // for (; length--;) {
    //   links[length].setAttribute('target', '_blank');
    //   links[length].setAttribute('rel', 'external noopener');
    // }
  }

  function initForm_() {
    var form = dom.document.forms['interests'];
    var input = form.elements['q'];

    dom.events.addEventListener(form, dom.events.TYPE.SUBMIT, function() {
      interests_.update(input.value.split(','), true);
      input.value = '';
      initInterestsList_();
      initContent_();
    });

    initAutoComplete_(input);
  }

  function initAutoComplete_(input) {
    var dataList = dom.createElement('datalist');
    var webView = ~dom.device.userAgent.indexOf('; wv)');
    var supported = 'list' in input && !webView &&
        Boolean(dataList && dom.context['HTMLDataListElement']);

    if (supported) {
      dom.appendChild(input.parentNode, dataList).id = 'typeahead';
      input.setAttribute('list', dataList.id);

      dom.events.addEventListener(input, dom.events.TYPE.INPUT, function() {
        /** @type {string} */ var value = util.String.trim(input.value);
        dom.clearElement(dataList);

        2 < value.length && api.typeahead(value, 10, function(data) {
          /** @type {number} */ var length = data && data.length;
          dom.clearElement(dataList);

          if (length) {
            for (; length--;) {
              /** @type {!Object} */ var item = data[length];
              /** @type {string} */ var value = item['screen_name'] ?
                  ('@' + item['screen_name']) : item['hashtag'];
              if (value) {
                dom.appendChild(
                    dataList, dom.createElement('OPTION')).value = value;
              }
            }
          }
        });
      });
    }
  }

  function initSettingList_(key) {
    var list = settings_[key].get();
    var keys = util.Object.keys(list);
    var length = keys.length;
    var html = '';
    var node = dom.getElementById(key + '-list');

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
      dom.getElementById('content').innerHTML =
          dom.getElementById('no-interest-template').textContent;
      dom.css.addClass(dom.getElementById('sidebar'), 'open');
    }
  }

  function initSettingRemoveItem_(key, node) {
    var links = dom.getElementsByTagName(node, 'a');
    var length = links.length;
    var link;

    for (; length--;) {
      link = links[length];
      dom.events.addEventListener(link, dom.events.TYPE.CLICK, function(e) {
        if (confirm('Are you sure you want to remove this ' + key + '?')) {
          var link = dom.events.getEventTarget(e);
          var value = link.getAttribute('data-value');
          if (value) {
            settings_[key].remove([value]);
            initSettingList_(key);
            initContent_();
          }
        }
        dom.events.preventDefault(e);
      });
    }
  }

  function initSettingEnableItem_(key, node) {
    var inputs = dom.getElementsByTagName(node, 'input');
    var length = inputs.length;

    for (; length--;) {
      inputs[length].onclick = function(e) {
        var input = dom.events.getEventTarget(e);
        var value = input.value;
        if (value) {
          settings_[key].update([value], input.checked);
          initSettingList_(key);
          initContent_();
        }
      };
    }
  }

  function initInterestsList_() {
    initSettingList_('interest');
  }

  function initUserConfig_() {
    /** @type {!Object.<string, number>} */ var data = config_.get();
    /** @type {!Object.<string, !Array>} */ var keys = {
      'interests-count': [dom.events.TYPE.CHANGE, initContent_],
      'dark-mode': [dom.events.TYPE.CLICK, initDarkMode_]
    };

    function addEventListener(input, item) {
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

        dom.events.addEventListener(input, event, function() {
          value = 'checkbox' == input.type ? +input.checked : input.value;
          data[input.id] = value;
          config_.set(data);
          handler();
        });
      }
    }

    for (var key in keys) {
      addEventListener(dom.getElementById(key), keys[key]);
    }
  }

  function initSourcesList_() {
    /** @type {string} */ var key = 'source';
    /** @type {!Object.<string, number>} */ var list = settings_[key].get();

    if (util.Object.keys(list).length != util.Object.keys(sources_).length) {
      settings_[key].update(util.Object.keys(sources_), true);
    }

    initSettingList_(key);
  }

  function initContent_() {
    var interests = interests_.get();
    var names = [];
    var hashtags = [];
    var keywords = [];
    var keys = util.Object.keys(interests);
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
    /** @type {!Object.<string, !reader.Parser>} */ var enabled = {};
    /** @type {!Object.<string, number>} */ var list = settings_[key].get();

    for (key in list) {
      if (list[key]) {
        enabled[key] = sources_[key];
      }
    }

    if (util.Object.keys(enabled).length) {
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
    dom.getElementById('content').innerHTML =
        dom.getElementById(key + '-template').textContent;
  }

  function escape_(str) {
    return str.replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/\"/g, '&quot;').
        replace(/\'/g, '&#39;');
  }

  function initHeaderControls_() {
    dom.events.addEventListener(
        dom.getElementById('update-button'),
        dom.events.TYPE.CLICK, function(e) {
          dom.events.preventDefault(e);
          api.cacheEnabled = false;
          initContent_();
        });

    /** @type {!Object.<string, number>} */ var data = config_.get();
    /** @type {?Element} */ var sidebar = dom.getElementById('sidebar');

    dom.events.addEventListener(
        dom.getElementById('settings-button'),
        dom.events.TYPE.CLICK, function(e) {
          dom.events.preventDefault(e);
          dom.css.toggleClass(sidebar, 'open');
          data[sidebar.id] = +dom.css.hasClass(sidebar, 'open');
          config_.set(data);
        });

    dom.css.addClass(sidebar, +data[sidebar.id] ? 'open' : '');
  }

  function initDarkMode_() {
    /** @type {!Object.<string, number>} */ var data = config_.get();

    if (!('dark-mode' in data) && dom.context.matchMedia) {
      var query = '(prefers-color-scheme: dark)';
      data['dark-mode'] = +dom.context.matchMedia(query).matches;
      config_.set(data);
    }

    if (+data['dark-mode']) {
      dom.css.addClass(dom.document.body, 'dark');
    } else {
      dom.css.removeClass(dom.document.body, 'dark');
    }
  }

  function initPlatform_() {
    /** @type {string} */ var userAgent = dom.device.userAgent;

    if (/iPad|iPhone|iPod/.test(userAgent) && !dom.context['MSStream']) {
      dom.css.addClass(dom.document.body, 'ios');
    // } else if (/android/i.test(userAgent)) {
    //   dom.css.addClass(dom.document.body, 'md');
    } else {
      dom.css.addClass(dom.document.body, 'md');
    }
  }

  function init_() {
    initPlatform_();
    initDarkMode_();
    initForm_();
    initHeaderControls_();
    initInterestsList_();
    initSourcesList_();
    initUserConfig_();
    initContent_();
    dom.css.removeClass(dom.document.body, 'no-js');
  }

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!reader.App}
   * @private
   */
  var self_ = this;

  /**
   * @type {!Object}
   * @private
   */
  var content_ = {};

  /**
   * @type {number}
   * @private
   */
  var count_ = 0;

  var api = new reader.Api;
  var interests_ = new reader.DataStorage('interests');
  var config_ = new reader.DataStorage('config');
  var extractor_ = new reader.MediaExtractor(api);
  var worker_ = new reader.Worker;

  /**
   * @type {!Object.<string, !reader.DataStorage>}
   * @private
   */
  var settings_ = {
    'interest': interests_,
    'source': new reader.DataStorage('sources')
  };

  /**
   * @type {!Object.<string, !reader.Parser>}
   * @private
   */
  var sources_ = {
    'twitter': new reader.Twitter,
    // Google+ API is deprecated.
    // 'google': new reader.Google,
    'reddit': new reader.Reddit
  };

  init_();
};

// For "bundle-debug.js"
setTimeout(function() { new reader.App; }, 99);

// Comment this while debug mode.
//new reader.App;

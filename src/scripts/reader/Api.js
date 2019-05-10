/**
 * @fileoverview Simple implementation of JSONP-based API service.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://en.wikipedia.org/wiki/JSONP
 *
 * @requires net.JSONP
 * @requires util.Object
 * @requires util.StringUtils.URI
 */



/**
 * @constructor
 */
reader.Api = function() {
  /** @type {boolean} */ this.cacheEnabled = true;

  /** @const {string} */ var API_HOST = 'api.anonace.com';
  /** @const {string} */ var API_PROTO = 'https';
  /** @const {string} */ var API_PATH = '/v1/';

  // /** @const {string} */ var API_HOST = 'localhost';
  // /** @const {string} */ var API_PROTO = 'http';
  // /** @const {string} */ var API_PATH = '/anonace/v1/';

  /** @const {string} */ var API_BASE = API_PROTO + '://' + API_HOST + API_PATH;

  /**
   * @param {string} query The search query as string.
   * @param {number} count The max results count as integer.
   * @param {!Function} callback The callback function.
   */
  this.typeahead = function(query, count, callback) {
    /** @type {string} */ var url = API_BASE + 'typeahead?q=' +
                                    util.StringUtils.URI.encode(query) +
                                    '&c=' + count;
    load_(url, callback);
  };

  /**
   * @param {!Object.<string, !reader.Parser>} sources The search sources.
   * @param {string} query The search query or nickname as string.
   * @param {number} count The max results count as integer.
   * @param {!Function} callback The callback function.
   */
  this.search = function(sources, query, count, callback) {
    /** @type {number} */ var length = util.Object.keys(sources).length;
    /** @type {!Object.<string, *>} */ var result = {};
    /** @type {string} */ var source;

    for (source in sources) {
      (function(source) {
        if (sources[source]) {
          /** @type {string} */ var url = API_BASE + 'search?q=' +
                                          sources[source].encodeQuery(query) +
                                          '&c=' + count + '&s=' + source;
          load_(url, function(data) {
            result[source] = data;
            data && data['error'] && console.log('[ERROR]', source, data);
            0 == --length && callback(result);
          });
        }
      })(source);
    }
  };

  /**
   * @param {string} url The URL to load.
   * @param {!Function} callback The callback function.
   */
  this.proxy = function(url, callback) {
    url = API_BASE + 'proxy?url=' + util.StringUtils.URI.encode(url);
    load_(url, callback);
  };

  /**
   * @param {string} url The URL to load.
   * @param {!Function} callback The callback function.
   * @private
   */
  function load_(url, callback) {
    /** @type {string} */ var key = url.replace(/\W+/g, '-');
    /** @type {*} */ var content = self_.cacheEnabled ? cache_[key] : dom.NULL;

    if (content) {
      callback(content);
    } else {
      net.JSONP.load(url, function(content) {
        cache_[key] = content;
        callback(content);
      });
    }
  }

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!reader.Api}
   * @private
   */
  var self_ = this;

  /**
   * @type {Object.<string, *>}
   * @private
   */
  var cache_ = {};
};

/**
 * @fileoverview Simple implementation of JSONP-based API service.
 *
 * @see https://google.github.io/styleguide/javascriptguide.xml
 * @see https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler
 * @see https://en.wikipedia.org/wiki/JSONP
 */

import * as glize from 'glize';
import {Parser} from './parser.js';


/**
 * @constructor
 */
export const Api = function() {

  const /** string */ API_KEY = atob(
        'QUtmeWNid3I2NHhQREFhdkNnVFhubGc3N3BFaUhsTTdYLUUx'+
        'TTlWc0JkNkRYelJDWndNUVN0d044V1E0b21iMkhieWxTMWRz');

  const /** string */ API_URL = 'https://script.google.com/macros/s/' +
                                API_KEY + '/exec';

  /** @type {boolean} */ this.cacheEnabled = true;

  /**
   * @param {string} query The search query as string.
   * @param {number} count The max results count as integer.
   * @param {!Function} callback The callback function.
   */
  this.typeahead = (query, count, callback) => {
    const /** string */ url = API_URL + '?action=typeahead' +
                              '&source=twitter&query=' +
                              encodeURIComponent(query) +
                              '&count=' + count;
    load_(url, callback);
  };

  /**
   * @param {!Object<string, !Parser>} sources The search sources.
   * @param {string} query The search query or nickname as string.
   * @param {number} count The max results count as integer.
   * @param {!Function} callback The callback function.
   */
  this.search = (sources, query, count, callback) => {
    let /** number */ length = Object.keys(sources).length;
    const /** !Object<string, *> */ result = {};

    const /** !Function */ search = source => {
      if (sources[source]) {
        let /** string */ url = API_URL + '?action=search' +
                                '&source=' + source + '&query=' +
                                sources[source].encodeQuery(query) +
                                '&count=' + count;
        load_(url, (data) => {
          result[source] = data;
          data && data['error'] && console.log('[ERROR]', source, data);
          0 == --length && callback(result);
        });
      }
    };

    for (let /** string */ source in sources) {
      search(source);
    }
  };

  /**
   * @param {string} url The URL to load.
   * @param {!Function} callback The callback function.
   */
  this.proxy = (url, callback) => {
    url = API_URL + '?action=proxy&query=' + encodeURIComponent(url);
    load_(url, callback);
  };

  /**
   * @param {string} url The URL to load.
   * @param {!Function} callback The callback function.
   * @private
   */
  const load_ = (url, callback) => {
    const /** string */ key = url.replace(/\W+/g, '-');
    let /** ?Object */ content = self_.cacheEnabled ? cache_[key] : null;

    if (content) {
      callback(content);
    } else {
      glize.net.jsonp.load(url).then((content) => {
        cache_[key] = content;
        callback(content);
      });
    }
  };

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @private {!Api}
   */
  const self_ = this;

  /**
   * @private {!Object<string, ?Object>}
   */
  const cache_ = {};
};

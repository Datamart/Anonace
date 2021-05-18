/**
 * @fileoverview Simple implementation of Twitter API service.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/tweet-object
 */

import {MediaExtractor} from './extractor.js';
import {getDocument} from '../glize/dom/index.js';
import {Parser} from './parser.js';


/**
 * @extends {Parser}
 * @constructor
 */
export const Twitter = function() {
  Parser.call(this);

  const doc = getDocument();
  const /** string */ BASE_URL = 'https://twitter.com/';
  const /** string */ STATUS_URL = 'https://twitter.com/web/status/';
  const /** string */ HASHTAG_URI = 'https://twitter.com/hashtag/';
  const /** !RegExp */ LINK_PATTERN = /https?:\/\/t\.co\/\w+/img;

  /**
   * Encodes query string.
   * @param {string} query The query string to encode.
   * @return {string} Returns encoded query string.
   * @override
   */
  this.encodeQuery = (query) => {
    return encodeURIComponent(query.split(',').join(' OR '));
  };

  /**
   * @param {!Array<!Object>} data List of twits.
   * @param {!MediaExtractor} extractor The media extractor.
   * @return {!Object<string, *>}
   * @override
   */
  this.parse = (data, extractor) => {
    const /** !Object<string, !Array> */ result = {};
    let /** number */ length = data.length;

    for (; length--;) {
      const /** !Object */ item = data[length];
      if (item && item['id_str']) {
        let /** string */ text = item['full_text'] || item['text'] || '';
        const /** !Object */ user = item['user'] || {};
        const /** !Date */ date = new Date(item['created_at']);
        const /** string */ key = self_.getKey(date);

        if (item['retweeted_status'] && text.indexOf('RT @') == 0) {
          text = text.split(': ')[0] + ': ' +
                 item['retweeted_status']['full_text'];
        }

        item['date'] = item['created_at'].split(' +0000')[0];
        user['profile_image_url'] = (
            user['profile_image_url'] || '').replace(/^http\:/, 'https:');

        findMedia_(item, extractor);
        result[key] = result[key] || [];
        result[key].push(self_.parseItemTemplate({
          'source': 'twitter',
          'id': item['id_str'],
          'text': self_.formatUserNames(self_.formatHashTags(self_.formatLinks(
              text, LINK_PATTERN), HASHTAG_URI), BASE_URL),
          'link': STATUS_URL + item['id_str'],
          'date': self_.formatDate(date),
          'media': item['media'] || '',
          'author_avatar': user['profile_image_url'],
          'author_name': user['name'],
          'author_link': BASE_URL + user['screen_name']
        }));
      }
    }

    return result;
  };

  const findMedia_ = (item, extractor) => {
    let media = ((item['extended_entities'] || {})['media'] || [])[0];
    const url = media && media['media_url_https'];
    const status = STATUS_URL + item['id_str'];

    if (url && url.indexOf('https:') == 0) {
      item['media'] = self_.getImageHtml(url, status);
    } else {
      media = ((item['entities'] || {})['urls'] || [])[0];
      extractor.extract(media && media['expanded_url'], (media) => {
        let html = '';
        if ('image' == media['type']) {
          html = self_.getImageHtml(media['url'], status);
        } else if ('youtube' == media['type']) {
          html = self_.getYoutubeHtml(media['url']);
        }

        const div = doc.getElementById('media-' + item['id_str']);
        if (div) {
          div.innerHTML = html;
        } else {
          item['media'] = html;
        }
      });
    }

    return url;
  };

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @private {!Twitter}
   */
  const self_ = this;
};

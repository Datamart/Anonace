/**
 * @fileoverview Simple implementation of data parser.
 *
 * @see https://google.github.io/styleguide/javascriptguide.xml
 * @see https://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://github.com/Datamart/Glize
 */

import {getDocument} from '../glize/dom/index.js';
import {parseTemplate} from '../glize/dom/template.js';
import {formatDate} from '../glize/formatters/date.js';
import {DataStorage} from './storage.js';
import {MediaExtractor} from './extractor.js';


/**
 * @constructor
 */
export const Parser = function() {
  const doc = getDocument();

  /**
   * @param {!Array<!Object>} data List of data items.
   * @param {!MediaExtractor} extractor The media extractor.
   * @return {!Object<string, *>}
   */
  this.parse = (data, extractor) => {};

  /**
   * Encodes query string. Can be overwritten in sub-classes.
   * @param {string} query The query string to encode.
   * @return {string} Returns encoded query string.
   */
  this.encodeQuery = (query) => encodeURIComponent(query);

  /**
   * @param {string} key The template key.
   * @param {!Object} values The template values as dict.
   * @return {string} Returns parsed template text content.
   */
  this.parseTemplate = (key, values) => {
    if (!templates_[key]) {
      templates_[key] = doc.getElementById(key + '-template').textContent;
    }
    return parseTemplate(templates_[key], values);
  };

  /**
   * @param {!Object} values The template values.
   * @return {string} Returns parsed template text content.
   */
  this.parseItemTemplate = (values) => {
    return self_.parseTemplate('content-item', values);
  };

  /**
   * @param {!Object} values The template values.
   * @return {string} Returns parsed template text content.
   * @deprecated Use 'parseTemplate' instead.
   */
  this.parseInterestTemplate = (values) => {
    return self_.parseTemplate('interest-item', values);
  };

  this.getKey = (date) => {
    return date.toISOString().replace(/\D+/g, '');
  };

  this.getImageHtml = (image, link) => {
    // const /** !Object<string, number> */ data = config_.get();
    // const /** string */ theme = +data['dark-mode'] ? '424242' : 'eee';
    // crossorigin="anonymous" // get it from data

    // https://developer.wordpress.com/docs/photon/api/
    // image = 'https://i0.wp.com/' + image.split(/^https?:\/\//)[1] + '?h=250';

    return self_.parseTemplate(
        'image-frame', {'image': image, 'link': link /*, 'theme': theme*/ });
  };

  this.getYoutubeHtml = (url) => {
    return self_.parseTemplate('iframe-frame', {'url': url});
  };

  this.formatDate = (date) => {
    return formatDate(date, 'dd MMM, YYYY  hh:mm');
  };

  this.formatHashTags = (text, base) => {
    return formatLinks_(text, base, /#([^\s\?\)#@:!…]+)/img);
  };

  this.formatUserNames = (text, base) => {
    return formatLinks_(text, base, /@([^\s\?\)#@:!…]+)/img);
  };

  this.formatLinks = (text, pattern) => {
    return formatLinks_(text, '', pattern);
  };

  const formatLinks_ = (text, base, pattern) => {
    const /** !Array<string> */ matches = text.match(pattern) || [];
    const /** string */ chars = '([\\[\\]\\s\\-\\:\\?\\.,;!])';
    let /** number */ length = matches.length;
    let /** string */ link;
    let /** string */ match;

    for (; length--;) {
      match = matches[length];
      link = '<a href="' + base + (base ? match.substr(1) : match) + '"' +
             ' rel="external noopener"' +
             (doc.body.classList.contains('ios') ?
          '' : ' onclick="window.open(this.href);return false"') +
             ' target="_blank">' + match + '</a>';
      try {
        match = match.replace(/([\?\.\+\*])/g, '\\$1');
        text = text.replace(
            new RegExp(chars + match + chars, 'img'), '$1' + link + '$2');
        text = text.replace(
            new RegExp(chars + match + '$', 'img'), '$1' + link);
        text = text.replace(
            new RegExp('^' + match + chars, 'img'), link + '$1');
        text = text.replace(
            new RegExp('^' + match + '$', 'img'), link);
      } catch (e) {
        console.log(e || e.message);
      }
    }

    return text;
  };

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @private {!Parser}
   */
  const self_ = this;

  /**
   * @private {!DataStorage}
   */
  const config_ = new DataStorage('config');

  /**
   * Key-value storage for loaded templates.
   * @private {!Object<string, string>}
   */
  const templates_ = {};
};

/**
 * @fileoverview Simple implementation of data parser.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 *
 * @requires dom.Template
 * @requires formatters.DateFormatter
 * @requires util.StringUtils.URI
 */



/**
 * @constructor
 */
reader.Parser = function() {

  /**
   * @param {Array.<!Object>} data List of data items.
   * @param {!reader.MediaExtractor} extractor The media extractor.
   * @return {!Object.<string, *>}
   */
  this.parse = function(data, extractor) {return {}};

  /**
   * Encodes query string. Can be overwritten in sub-classes.
   * @param {string} query The query string to encode.
   * @return {string} Returns encoded query string.
   */
  this.encodeQuery = function(query) {
    return util.StringUtils.URI.encode(query);
  };

  /**
   * @param {string} key The template key.
   * @param {!Object} values The template values as dict.
   * @return {string} Returns parsed template text content.
   */
  this.parseTemplate = function(key, values) {
    if (!templates_[key]) {
      templates_[key] = dom.getElementById(key + '-template').textContent;
    }
    return template_.parse(templates_[key], values);
  };

  /**
   * @param {!Object} values The template values.
   * @return {string} Returns parsed template text content.
   */
  this.parseItemTemplate = function(values) {
    return self_.parseTemplate('content-item', values);
  };

  /**
   * @param {!Object} values The template values.
   * @return {string} Returns parsed template text content.
   * @deprecated Use 'parseTemplate' instead.
   */
  this.parseInterestTemplate = function(values) {
    return self_.parseTemplate('interest-item', values);
  };

  this.getKey = function(date) {
    return date.toISOString().replace(/\D+/g, '');
  };

  this.getImageHtml = function(image, link) {
    /** @type {!Object.<string, number>} */ var data = config_.get();
    /** @type {string} */ var theme = +data['dark-mode'] ? '424242' : 'eee';
    return self_.parseTemplate(
        'image-frame', {'image': image, 'link': link, 'theme': theme});
  };

  this.getYoutubeHtml = function(url) {
    return self_.parseTemplate('iframe-frame', {'url': url});
  };

  this.formatDate = function(date) {
    return formatters.DateFormatter.formatDate(date, 'dd MMM, YYYY  hh:mm');
  };

  this.formatHashTags = function(text, base) {
    return formatLinks_(text, base, /#([^\s\?\)#@:!…]+)/img);
  };

  this.formatUserNames = function(text, base) {
    return formatLinks_(text, base, /@([^\s\?\)#@:!…]+)/img);
  };

  this.formatLinks = function(text, pattern) {
    return formatLinks_(text, '', pattern);
  };

  function formatLinks_(text, base, pattern) {
    /** @type {!Array.<string>} */ var matches = text.match(pattern) || [];
    /** @type {number} */ var length = matches.length;
    /** @type {string} */ var chars = '([\\[\\]\\s\\-\\:\\?\\.,;!])';
    /** @type {string} */ var link;
    /** @type {string} */ var match;

    for (; length--;) {
      match = matches[length];
      link = '<a href="' + base + (base ? match.substr(1) : match) + '"' +
             ' rel="external noopener"' +
             (dom.css.hasClass(dom.document.body, 'ios') ?
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
  }

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!reader.Parser}
   * @private
   */
  var self_ = this;

  /**
   * @type {!dom.Template}
   * @private
   */
  var template_ = new dom.Template;

  /**
   * @type {!reader.DataStorage}
   * @private
   */
  var config_ = new reader.DataStorage('config');

  /**
   * Key-value storage for loaded templates.
   * @type {!Object.<string, string>}
   * @private
   */
  var templates_ = {};
};

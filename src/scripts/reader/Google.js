/**
 * @fileoverview Simple implementation of Google+ API service.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://developers.google.com/+/web/api/rest/latest/activities
 *
 * @requires util.StringUtils.URI
 */



/**
 * @extends {reader.Parser}
 * @constructor
 * @deprecated On March 7, 2019, all Google+ APIs and Google+ Sign-in will
 *             be shut down completely. This will be a progressive shutdown,
 *             with API calls starting to intermittently fail as early as
 *             January 28, 2019, and OAuth requests for Google+ scopes
 *             starting to intermittently fail as early as February 15, 2019.
 */
reader.Google = function() {
  reader.Parser.call(this);

  /**
   * @param {!Array.<!Object>} data List of posts.
   * @param {!reader.MediaExtractor} extractor The media extractor.
   * @return {!Object.<string, *>}
   * @override
   */
  this.parse = function(data, extractor) {
    /** @type {!Object.<string, !Array>} */ var result = {};
    /** @type {number} */ var length = data.length;

    for (; length--;) {
      /** @type {!Object} */ var item = data[length];
      if (item['id']) {
        /** @type {!Object} */ var user = item['actor'] || {};
        /** @type {!Date} */ var date = new Date(item['published']);
        /** @type {string} */ var key = self_.getKey(date);
        /** @type {?Object} */ var attachment = item['object']['attachments'] &&
                                                item['object']['attachments'][0];
        /** @type {string} */ var text = item['object']['content'] ||
                                         item['title'];

        result[key] = result[key] || [];
        result[key].push(self_.parseItemTemplate({
          'source': 'google',
          'id': item['id'],
          'text': text || (attachment && attachment['content']) || '',
          'link': item['url'],
          'date': self_.formatDate(date),
          'media': findMedia_(item, extractor),
          'author_avatar': user['image'] && user['image']['url'],
          'author_name': user['displayName'],
          'author_link': user['url']
        }));
      }
    }

    return result;
  };

  function findMedia_(item, extractor) {
    /** @type {string} */ var html = '';
    /** @type {?Object} */ var attachment = item['object']['attachments'] &&
                                            item['object']['attachments'][0];
    /** @type {string} */ var image = attachment && attachment['image'] &&
                                      attachment['image']['url'];

    if (image) {
      html = self_.getImageHtml(image, item['url']);
    }

    return html;
  }

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!reader.Google}
   * @private
   */
  var self_ = this;
};

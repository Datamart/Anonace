/**
 * @fileoverview Simple implementation of Reddit API service.
 *
 * @see http://google.github.io/styleguide/javascriptguide.xml
 * @see http://developers.google.com/closure/compiler/docs/js-for-compiler
 * @see https://www.reddit.com/wiki/search
 */



/**
 * @extends {reader.Parser}
 * @constructor
 */
reader.Reddit = function() {
  reader.Parser.call(this);

  /**
   * @param {Array.<!Object>} data List of twits.
   * @param {!reader.MediaExtractor} extractor The media extractor.
   * @return {!Object.<string, Array>}
   * @override
   */
  this.parse = function(data, extractor) {
    /** @type {!Object.<string, *>} */ var result = {};
    /** @type {number} */ var length = data.length;

    for (; length--;) {
      /** @type {!Object} */ var item = data[length]['data'];
      if (item) {
        var date = new Date(item['created'] * 1E3);
        var key = self_.getKey(date);

        result[key] = result[key] || [];
        result[key].push(self_.parseItemTemplate({
          'source': 'reddit',
          'id': item['id'],
          'text': item['title'], // item['selftext'] ||
          'link': 'https://www.reddit.com' + item['permalink'],
          //'link': item['url'],
          'date': self_.formatDate(date),
          'media': findMedia_(item, extractor),
          'author_avatar': 'https://www.reddit.com/favicon.ico',
          'author_name': item['author'],
          'author_link': 'https://www.reddit.com/user/' + item['author']
        }));
      }
    }

    return result;
  };

  function findMedia_(item, extractor) {
    var html = getEmbededHtml_(item);
    var mp4 = 'fallback_url';
    var hls = 'hls_url';
    var preview;
    var image;
    var media;

    function fix(url) {
      return url.replace('?source=fallback', '');
    }

    if (!html) {
      preview = item['preview'];
      media = preview && preview['images'];
      if (media && media[0]) {
        image = media[0]['source'] && media[0]['source']['url'];
      }

      media = item['secure_media'] && item['secure_media']['reddit_video'];
      if (media && media[mp4]) {
        html = getVideoHtml_(fix(media[mp4]), media[hls], image);

        if (!html) {
          media = item['media'] && item['media']['reddit_video'];
          if (media && media[mp4]) {
            html = getVideoHtml_(fix(media[mp4]), media[hls], image);

            if (!html) {
              media = preview && preview['reddit_video_preview'];
              if (media && media[mp4]) {
                html = getVideoHtml_(fix(media[mp4]), media[hls], image);
              }
            }
          }
        }
      }

      if (!html && image) {
        html = self_.getImageHtml(
            image, 'https://www.reddit.com' + item['permalink']);
      }
    }

    return html;
  }

  function getEmbededHtml_(item) {
    var html = item['media_embed'] && item['media_embed']['content'];

    if (html) {
      html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      html = html.replace(/\s*autoplay[\s;]*/, ' ');
      html = html.replace(/\s*picture-in-picture[\s;]*/, ' ');
      html = html.replace('enablejsapi=1', '');
      // html = html.replace('<iframe ', '<iframe sandbox ');

      if (~html.indexOf('i.imgur.com')) {
        var str = util.StringUtils.URI.decode(html);
        var matches = str.match(/image=([^\?]*)/);
        var url = matches && matches[1];
        if (url && !url.indexOf('http')) {
          html = self_.getImageHtml(
              url, 'https://www.reddit.com' + item['permalink']);
        }
      }
    }

    return html;
  }

  function getVideoHtml_(mp4, hls, img) {
    return self_.parseTemplate(
        'reddit-video', {'mp4_url': mp4, 'hls_url': hls, 'img_url': img});
  }

  /**
   * The reference to current class instance.
   * Used in private methods and for preventing jslint errors.
   * @type {!reader.Reddit}
   * @private
   */
  var self_ = this;
};

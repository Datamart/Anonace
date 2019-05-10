


/**
 * @param {!reader.Api} api The instance of Api class.
 * @constructor
 */
reader.MediaExtractor = function(api) {

  // https://www.youtube.com/watch?v=RVISnYwaB9M
  // https://www.youtube.com/watch?v=RVISnYwaB9M&feature=share
  // https://www.youtube.com/attribution_link?a=XXXXXXXXXX&u=%2Fwatch%3Fv%3DRVISnYwaB9M%26feature%3Dshare
  // http://youtu.be/RVISnYwaB9M?a
  // https://youtu.be/RVISnYwaB9M
  var YOUTUBE_PATTERN = /^https?:\/\/(www\.)?((youtu\.be)|youtube\.com)\//;
  var TAGS_PATTERN =
      /<(img|image|input|svg|script|link|i?frame|object|form|video|audio)/img;

  this.extract = function(url, callback) {
    if (url) {
      if (YOUTUBE_PATTERN.test(url)) {
        getYouTubeVideo_(url, callback);
      } else {
        getImage_(url, callback);
      }
    }
  };

  function getYouTubeVideo_(url, callback) {
    var loc = new net.URL(url);
    var map = request_.getParameterMap(loc);
    var videoId = map['v'];

    if (!videoId && loc['hostname'] == 'youtu.be') {
      // http://youtu.be/RVISnYwaB9M?a
      // https://youtu.be/RVISnYwaB9M
      videoId = loc['pathname'].replace(/\W+/g, '');
    }

    if (videoId) {
      // https://developers.google.com/youtube/player_parameters
      callback({
        'type': 'youtube',
        'url': 'https://www.youtube.com/embed/' + videoId +
            '?modestbranding=1&origin=' + location.hostname
      });
    }
  }

  function getImage_(url, callback) {
    api.proxy(url, function(res) {
      /** @type {string} */ var content = (res[0] || '');
      if (content) {
        /** @type {Element} */ var element = dom.createElement('div');
        element.innerHTML = content.replace(
            TAGS_PATTERN, '<br ').replace(
            /background(-image)\s*\:/img, 'tmp:'); //.substr(0, 2048);

        var nodes = dom.querySelectorAll(element, 'meta');
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          var name = node.getAttribute('name') ||
              node.getAttribute('property') ||
              node.getAttribute('itemprop') || '';

          if (name == 'twitter:image:src' || name == 'twitter:image' ||
              name == 'og:image' || name == 'image') {
            /** @type {string} */ var src = node.getAttribute('content');
            if (src && src.indexOf('http') == 0) {
              callback({
                'type': 'image',
                'url': src.replace(/^http\:/, 'https:')
              });
            }
            break;
          }
        }
        element = dom.NULL;
      }
    });
  }

  var request_ = new net.ServletRequest;
};




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
  const YOUTUBE_PATTERN = /^https?:\/\/(www\.)?((youtu\.be)|youtube\.com)\//;
  const TAGS_PATTERN =
      /<(img|image|input|svg|script|link|i?frame|object|form|video|audio)/img;

  this.extract = (url, callback) => {
    if (url) {
      if (YOUTUBE_PATTERN.test(url)) {
        getYouTubeVideo_(url, callback);
      } else {
        getImage_(url, callback);
      }
    }
  };

  const getYouTubeVideo_ = (url, callback) => {
    const /** !net.URL */ loc = new net.URL(url);
    const /** !Object */ map = request_.getParameterMap(loc);
    let /** string */ videoId = map['v'];

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
  };

  const getImage_ = (url, callback) => {
    api.proxy(url, (res) => {
      const /** string */ content = (res[0] || '');
      if (content) {
        let /** ?Element */ element = dom.createElement('div');
        element.innerHTML = content.replace(
            TAGS_PATTERN, '<br ').replace(
            /background(-image)\s*\:/img, 'tmp:'); //.substr(0, 2048);

        const nodes = dom.querySelectorAll(element, 'meta');
        for (let i = 0; i < nodes.length; i++) {
          let node = nodes[i];
          let name = node.getAttribute('name') ||
              node.getAttribute('property') ||
              node.getAttribute('itemprop') || '';

          if (name == 'twitter:image:src' || name == 'twitter:image' ||
              name == 'og:image' || name == 'image') {
            const /** string */ src = node.getAttribute('content');
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
  };

  const request_ = new net.ServletRequest;
};

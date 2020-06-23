/**
 * This file is auto-generated and emulates a JS bundle.
 */
(function() {
  const sorter = (a, b) => a.indexOf('__') > 0 ? -1 :
                           a.toLowerCase() < b.toLowerCase() ? -1 : 1;
  const scripts = [];
  scripts.push('/reader/MediaExtractor.js');
  scripts.push('/reader/Google.js');
  scripts.push('/reader/Worker.js');
  scripts.push('/reader/Reddit.js');
  scripts.push('/reader/Twitter.js');
  scripts.push('/reader/Api.js');
  scripts.push('/reader/Parser.js');
  scripts.push('/reader/__ns__.js');
  scripts.push('/reader/DataStorage.js');
  scripts.push('/glize/net/ServletRequest.js');
  scripts.push('/glize/net/HttpRequest.js');
  scripts.push('/glize/net/JSONP.js');
  scripts.push('/glize/net/URL.js');
  scripts.push('/glize/net/__ns__.js');
  scripts.push('/glize/locale/Validation.js');
  scripts.push('/glize/locale/Calendar.js');
  scripts.push('/glize/locale/__ns__.js');
  scripts.push('/glize/util/StringUtils.js');
  scripts.push('/glize/util/Object.js');
  scripts.push('/glize/util/Base64.js');
  scripts.push('/glize/util/Array.js');
  scripts.push('/glize/util/String.js');
  scripts.push('/glize/util/Date.js');
  scripts.push('/glize/util/__ns__.js');
  scripts.push('/glize/util/Locale.js');
  scripts.push('/glize/formatters/DateFormatter.js');
  scripts.push('/glize/formatters/NumberFormatter.js');
  scripts.push('/glize/formatters/BytesFormatter.js');
  scripts.push('/glize/formatters/__ns__.js');
  scripts.push('/glize/compressors/__ns__.js');
  scripts.push('/glize/dom/Cookies.js');
  scripts.push('/glize/dom/__ns__.js');
  scripts.push('/glize/dom/Template.js');
  scripts.push('/glize/dom/DataStorage.js');
  scripts.sort(sorter);
  for(let i = 0; i < scripts.length; i++) {
    document.write('<script src="./scripts' + scripts[i] + '"></script>');
  }
})();

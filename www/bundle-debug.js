(function() {
  var scripts = [
    'glize/dom/__ns__.js',
    'glize/dom/Cookies.js',
    'glize/dom/DataStorage.js',
    'glize/dom/Template.js',

    'glize/compressors/__ns__.js',

    'glize/formatters/__ns__.js',
    'glize/formatters/DateFormatter.js',

    'glize/locale/__ns__.js',
    'glize/locale/Calendar.js',

    'glize/net/__ns__.js',
    'glize/net/HttpRequest.js',
    'glize/net/JSONP.js',
    'glize/net/ServletRequest.js',
    'glize/net/URL.js',

    'glize/util/__ns__.js',
    'glize/util/Array.js',
    'glize/util/Base64.js',
    'glize/util/Date.js',
    'glize/util/Object.js',
    'glize/util/Locale.js',
    'glize/util/String.js',
    'glize/util/StringUtils.js',

    'reader/__ns__.js',
    'reader/Api.js',
    'reader/DataStorage.js',
    'reader/Google.js',
    'reader/MediaExtractor.js',
    'reader/Parser.js',
    'reader/Reddit.js',
    'reader/Twitter.js',
    'reader/Worker.js'
  ];

  for (var i = 0; i < scripts.length; i++) {
    // var s = document.createElement('SCRIPT');
    // s.src = '../src/scripts/' + scripts[i];
    // document.body.appendChild(s);
    document.write('<script src="../src/scripts/' + scripts[i] + '"></script>');
  }
})();



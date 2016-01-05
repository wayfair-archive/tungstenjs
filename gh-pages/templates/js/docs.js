CodeMirror.defineMode('mustache', function(config, parserConfig) {
  var mustacheOverlay = {
    token: function(stream) {
      var ch;
      if (stream.match('{{')) {
        while ((ch = stream.next()) != null)
          if (ch == '}' && stream.next() == '}') {
            stream.eat('}');
            return 'mustache';
          }
      }
      while (stream.next() != null && !stream.match('{{', false)) {
      }
      return null;
    }
  };
  return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || 'text/html'), mustacheOverlay);
});

window.setTimeout(function() {
  _.each(document.querySelectorAll('pre > code'), function(el) {
    var code = el.textContent;
    var mode = el.className ? el.className.substring(5) : 'javascript';
    if (mode === 'html') {
      mode = 'mustache';
    }
    el.innerHTML = '';
    CodeMirror(el, {
      value: code,
      mode: mode,
      readOnly: true
    });
  });
}, 0);
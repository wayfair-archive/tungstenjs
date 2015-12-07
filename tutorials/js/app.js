(function() {
  'use strict';
  CodeMirror.defineMode('mustache', function(config, parserConfig) {
    var mustacheOverlay = {
      token: function(stream, state) {
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
  Ractive.DEBUG = false;
  var tungstenCode = CodeMirror.fromTextArea(document.getElementById('tungsten'), {lineNumbers: true, mode: 'javascript'});
  var templateCode = CodeMirror.fromTextArea(document.getElementById('template'), {lineNumbers: true, mode: 'mustache'});
  tungstenCode.getDoc().markText({line: 0, ch: 0}, {line: 1, ch: 0}, {readOnly: true});
  var newLines = /\n/g;
  document.querySelector('#run').addEventListener('click', function() {
    var boilerplate = 'var rawTemplates = { app_view: \'<div id=\"app\">' + templateCode.getValue().replace(newLines, '') + '</div>\' };var compiledTemplates = tungsten.template.compileTemplates(rawTemplates);';
    eval(boilerplate + '\n;' + tungstenCode.getValue());
  });
}());
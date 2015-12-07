(function() {
  'use strict';
  var tungstenCode = CodeMirror.fromTextArea(document.getElementById('tungsten'), {lineNumbers: true, mode: 'javascript'});
  var templateCode = CodeMirror.fromTextArea(document.getElementById('template'), {lineNumbers: true, mode: 'xml'});
  tungstenCode.getDoc().markText({line: 0, ch: 0}, {line: 1, ch: 0}, {readOnly: true});
  document.querySelector('#run').addEventListener('click', function() {
    var boilerplate = 'var rawTemplates = { app_view: "<div id=\'app\'>' + templateCode.getValue() + '</div>" };var compiledTemplates = tungsten.template.compileTemplates(rawTemplates);';
    eval(boilerplate + '\n;' + tungstenCode.getValue());
  });
}());
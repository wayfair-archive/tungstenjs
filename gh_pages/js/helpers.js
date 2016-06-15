var helpers = {
  // extension for mustache highlighting in CodeMirror
  initMustacheCode: function(CodeMirror) {
    CodeMirror.defineMode('mustache', function(config, parserConfig) {
      var mustacheOverlay = {
        token: function(stream) {
          var ch;
          if (stream.match('{{')) {
            while ((ch = stream.next()) != null) {
              if (ch == '}' && stream.next() == '}') {
                stream.eat('}');
                return 'mustache';
              }
            }
          }
          while (stream.next() != null && !stream.match('{{', false)) {
          }
          return null;
        }
      };
      return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || 'text/html'), mustacheOverlay);
    });
  },
  activatePowerMode: function() {
    POWERMODE.colorful = true;
    window.setTimeout(function() {
      document.querySelectorAll('.CodeMirror').forEach(function(el) {
        el.addEventListener('input', POWERMODE);
      });
    }, 500);
  },
  // code options for CodeMirror
  codeOptions: {
    lineNumbers: true,
    lineWrapping: true,
    extraKeys: {
      'Ctrl-Alt-Q': function(cm) { cm.foldCode(cm.getCursor()); },
      'Ctrl-Alt-F': function(cm) {
        cm.operation(function() {
          for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
            cm.foldCode({
              line: l,
              ch: 0
            }, null, 'fold');
          }
        });
      },
      'Ctrl-Alt-U': function(cm) {
        cm.operation(function() {
          for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
            cm.foldCode({
              line: l,
              ch: 0
            }, null, 'unfold');
          }
        });
      }
    },
    foldGutter: true,
    lint: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers']
  },
  // fn for toggling code folding in CodeMirror
  toggleFold: function(cm, fold) {
    cm.operation(function() {
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
        cm.foldCode({line: l, ch: 0}, null, fold ? 'fold' : unfold);
      }
    });
  },
  // keydown handler for code editor
  editorKeydown: function(e) {
    // shift + enter
    if (e.shiftKey && e.which === 13) {
      this.run();
      return false;
    }
    // ctrl + s
    if (e.ctrlKey && e.which === 83) {
      this.run();
      return false;
    }
    // meta + s
    if (e.metaKey && e.which === 83) {
      this.run();
      return false;
    }
  }
};
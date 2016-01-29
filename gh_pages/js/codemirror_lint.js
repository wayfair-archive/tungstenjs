(function(CodeMirror, eslint) {
  'use strict';

  var eslintConfig = {
    'rules': {
      'quotes': [
        2,
        'single'
      ],
      'semi': [
        2,
        'always'
      ]
    },
    'env': {
      'es6': true,
      'browser': true
    },
    'globals': {
      'require': true,
      'module': true
    },
    'extends': 'eslint:recommended'
  };

  function validator(text) {
    var result = [];
    var errors = eslint.verify(text, eslintConfig);
    for (var i = 0; i < errors.length; i++) {
      var error = errors[i];
      result.push({
        message: error.message,
        severity: getSeverity(error),
        from: getPos(error, true),
        to: getPos(error, false)
      });
    }
    return result;
  }

  CodeMirror.registerHelper('lint', 'javascript', validator);

  function getPos(error, from) {
    var line = error.line - 1,
      ch = from ? error.column : error.column + 1;
    if (error.node && error.node.loc) {
      line = from ? error.node.loc.start.line - 1 : error.node.loc.end.line - 1;
      ch = from ? error.node.loc.start.column : error.node.loc.end.column;
    }
    return CodeMirror.Pos(line, ch);
  }

  function getSeverity(error) {
    switch (error.severity) {
      case 1:
        return 'warning';
      case 2:
        return 'error';
      default:
        return 'error';
    }
  }
})(window.CodeMirror, window.eslint);

var rawTemplates = {
  app: '<div id="menu"><div class="pure-menu"><a class="pure-menu-heading" href="#">Tungsten.js</a><ul class="pure-menu-list">{{#tutorials}} <li class="pure-menu-item"><a href="#" class="pure-menu-link js-tutorial-select">{{name}}</a></li>{{/tutorials}} </ul></div></div><div class="pure-g js-main">{{#tutorial}}<div class="pure-u-1-2 page-section description"><p>{{description}}</p><button class="pure-button js-run" id="run">Run</button></div><div class="pure-u-1-2 page-section"><textarea class="js-editor editor html" cols="30" rows="25" id="template" value="{{template}}">{{template}}</textarea></div><div class="pure-u-1-2 page-section"><div id="result"><div id="app"></div></div></div><div class="pure-u-1-2 page-section"><textarea class="js-editor editor" id="tungsten" cols="30" rows="25" value="{{js}}">{{js}}</textarea></div>{{/tutorial}}</div>'
};

var tungstenCode;
var templateCode;

// Compile templates; usually this is done at build time.
var compiledTemplates = tungsten.template.compileTemplates(rawTemplates);

var View = tungsten.backbone.View, Model = tungsten.backbone.Model, Collection = tungsten.backbone.Collection;

var TutorialSelectView = View.extend({
  events: {
    'click': function() {
      this.model.trigger('select', this.model);
    }
  }
});
var codeOptions = {
  lineNumbers: true,
  lineWrapping: true,
  extraKeys: {'Ctrl-Alt-Q': function(cm) { cm.foldCode(cm.getCursor()); }, 'Ctrl-Alt-F': function(cm) { cm.operation(function() { for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) cm.foldCode({line: l, ch: 0}, null, 'fold'); });}, 'Ctrl-Alt-U' : function(cm) { cm.operation(function() { for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) cm.foldCode({line: l, ch: 0}, null, 'unfold'); });} },
  foldGutter: true,
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
}
var AppView = View.extend({
  events: {
    'click .js-run': 'run',
    'keydown': 'handleKeydown'
  },
  handleKeydown: function(e) {
    if (e.shiftKey && e.which === 13) {
      this.run();
      return false;
    }
  },
  run: function() {
    var newLines = /\n/g;
    var boilerplate = 'var rawTemplates = { app_view: \'<div id=\"app\">' + templateCode.getValue().replace(newLines, '') + '</div>\' };var compiledTemplates = tungsten.template.compileTemplates(rawTemplates);';
    try {
      eval(boilerplate + '\n;' + tungstenCode.getValue());
    } catch (e) {
      document.querySelector('#app').innerHTML = '<br><span style="color: red;">ERROR: ' + e.toString() + '</span>';
    }
  },
  toggleFold: function(cm, fold) {
    cm.operation(function() {
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l)
        cm.foldCode({line: l, ch: 0}, null, fold ? 'fold' : unfold);
    });
  },
  postInitialize: function() {
    var self = this;
    var debouncedRun = _.debounce(this.run, 200);
    this.listenTo(this.model.get('tutorials'), 'select', function(tutorial) {
      if (tungstenCode && self.model.get('runOnKeyup')) {
        tungstenCode.off('change', debouncedRun);
        templateCode.off('change', debouncedRun);
      }
      self.model.set('tutorial', tutorial.toJSON());
      _.each(document.querySelectorAll('.CodeMirror'), function(editor) {
        editor.remove();
      });
      if (document.querySelector('#app')) {
        document.querySelector('#app').innerHTML = '<div id="app"></div>';
      }
      window.setTimeout(function() {
        tungstenCode = CodeMirror.fromTextArea(document.getElementById('tungsten'), _.extend({
          mode: 'javascript'
        }, codeOptions));
        templateCode = CodeMirror.fromTextArea(document.getElementById('template'), _.extend({
          mode: 'mustache'
        }, codeOptions));

        tungstenCode.getDoc().markText({line: 0, ch: 0}, {line: 1, ch: 0}, {readOnly: true});
        self.run();
        if (self.model.get('runOnKeyup')) {
          tungstenCode.on('change', debouncedRun);
          templateCode.on('change', debouncedRun);
        }
      }, 200);
    });
  }
  ,
  childViews: {
    'js-tutorial-select': TutorialSelectView
  }
});

var AppModel = Model.extend({
  relations: {tutorials: Collection, tutorial: Model},
});

new AppView({
  el: '#appwrapper',
  template: compiledTemplates.app,
  model: new AppModel(window.data),
  dynamicInitialize: true
});

(function() {
  'use strict';
  Ractive.DEBUG = false;

}());
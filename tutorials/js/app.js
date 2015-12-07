var rawTemplates = {
  app: '<div class="pure-u-1 page-section">{{#tutorials}}<button class="js-tutorial-select">{{name}}</button>{{/tutorials}}</div>{{#tutorial}}<div class="pure-u-1-2 page-section"><p>{{description}}</p><button class="pure-button" id="run">Run</button></div><div class="pure-u-1-2 page-section"><textarea class="editor html" cols="30" rows="25" id="template" value="{{template}}">{{template}}</textarea></div><div class="pure-u-1-2 page-section"><div id="result"><div id="app"></div></div></div><div class="pure-u-1-2 page-section"><textarea class="editor" id="tungsten" cols="30" rows="25" value="{{js}}">{{js}}</textarea></div>{{/tutorial}}'
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

var AppView = View.extend({
  postInitialize: function() {
    var self = this;
    this.listenTo(this.model.get('tutorials'), 'select', function(tutorial) {
      self.model.set('tutorial', tutorial.toJSON());
      _.each(document.querySelectorAll('.CodeMirror'), function(editor) {
        editor.remove();
      });
      document.querySelector('#app').innerHTML = '';
      window.setTimeout(function() {
        tungstenCode = CodeMirror.fromTextArea(document.getElementById('tungsten'), {
          lineNumbers: true,
          mode: 'javascript'
        });
        templateCode = CodeMirror.fromTextArea(document.getElementById('template'), {
          lineNumbers: true,
          mode: 'mustache'
        });
        tungstenCode.getDoc().markText({line: 0, ch: 0}, {line: 1, ch: 0}, {readOnly: true});
      }, 100);
    });
  },
  childViews: {
    'js-tutorial-select' : TutorialSelectView
  }
});

var AppModel = Model.extend({
  relations: {tutorials: Collection, tutorial: Model},
  defaults: {tutorial: {}}
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
  var newLines = /\n/g;
  document.querySelector('#run').addEventListener('click', function() {
    var boilerplate = 'var rawTemplates = { app_view: \'<div id=\"app\">' + templateCode.getValue().replace(newLines, '') + '</div>\' };var compiledTemplates = tungsten.template.compileTemplates(rawTemplates);';
    eval(boilerplate + '\n;' + tungstenCode.getValue());
  });
}());
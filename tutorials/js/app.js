(function() {
  'use strict';
  Ractive.DEBUG = false;

  var View = tungsten.backbone.View, Model = tungsten.backbone.Model, Collection = tungsten.backbone.Collection, tungstenCode, templateCode;

  // Code Mirror Extensions and options
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

  var codeOptions = {
    lineNumbers: true,
    lineWrapping: true,
    extraKeys: {
      'Ctrl-Alt-Q': function(cm) { cm.foldCode(cm.getCursor()); },
      'Ctrl-Alt-F': function(cm) {
        cm.operation(function() {
          for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) cm.foldCode({
            line: l,
            ch: 0
          }, null, 'fold');
        });
      },
      'Ctrl-Alt-U': function(cm) {
        cm.operation(function() {
          for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) cm.foldCode({
            line: l,
            ch: 0
          }, null, 'unfold');
        });
      }
    },
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  };

  // Views and Template
  var rawTemplates = {
    app: '<div id="menu"> <div class="pure-menu"><a class="pure-menu-heading" href="https://github.com/wayfair/tungstenjs">Tungsten.js</a><ul class="pure-menu-list">{{#tutorials}} <li class="pure-menu-item"><a href="#" class="pure-menu-link js-tutorial-select" {{#selected}}style="background: #333;"{{/selected}}>{{name}}</a></li> {{/tutorials}} </ul> </div> </div> <div class="pure-g js-main"> {{#tutorial}} <div class="pure-u-1-2 page-section description"> <ol class="steps"> {{#steps}} <li class="js-step-select pure-button {{#selected}}pure-button-active{{/selected}}">{{index}}</li> {{/steps}} </ol> <button class="pure-button js-run run" id="run">Run</button>{{#step}} <hr/><h4 class="step_name">{{name}}</h4><div class="step_description">{{{description_html}}}</div> {{/step}} </div> {{#step}} <div class="pure-u-1-2 page-section"><textarea class="js-editor editor html" cols="30" rows="25" id="template" value="{{template}}">{{template}}</textarea></div> <div class="pure-u-1-2 page-section"> <div id="result"> <div id="app"></div> </div> </div> <div class="last-editor-section pure-u-1-2 page-section"><textarea class="js-editor editor" id="tungsten" cols="30" rows="25" value="{{js}}">{{js}}</textarea></div> {{/step}} {{/tutorial}} </div>'
  };
  var compiledTemplates = tungsten.template.compileTemplates(rawTemplates);
  var TutorialSelectView = View.extend({
    events: {
      'click': function() {
        this.model.trigger('selectTutorial', this.model);
      }
    }
  });
  var StepSelectView = View.extend({
    events: {
      click: function() {
        this.model.trigger('selectStep', this.model);
      }
    }
  });
  var AppView = View.extend({
    events: {
      'click .js-run': 'run',
      'keydown': 'handleKeydown'
    },
    handleKeydown: function(e) {
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

      this.listenTo(this.model.get('tutorials'), 'selectTutorial', function(tutorial) {
        if (tungstenCode && self.model.get('runOnKeyup')) {
          tungstenCode.off('change', debouncedRun);
          templateCode.off('change', debouncedRun);
        }
        self.model.unset('step');
        self.model.unset('tutorial');

        self.model.get('tutorials').each(function(tutorials) {
          tutorials.set('selected', false);
        });
        tutorial.set('selected', true);

        self.model.set('tutorial', tutorial.toJSON());
        self.listenTo(self.model.get('tutorial').get('steps'), 'selectStep', function(s) {


          self.model.get('tutorial').get('steps').each(function(step) {
            step.set('selected', false);
          });
          s.set('selected', true);
          self.model.get('tutorial').set('step', s);
          _.each(document.querySelectorAll('.CodeMirror'), function(editor) {
            editor.remove();
          });
          if (document.querySelector('#app')) {
            document.querySelector('#app').innerHTML = '';
          }
          // Initialize Code Mirror in setTimeout
          window.setTimeout(function() {
            tungstenCode = CodeMirror.fromTextArea(document.getElementById('tungsten'), _.extend({
              mode: 'javascript'
            }, codeOptions));
            templateCode = CodeMirror.fromTextArea(document.getElementById('template'), _.extend({
              mode: 'mustache'
            }, codeOptions));

            if (self.model.get('tutorial').get('step').get('template_highlights')) {
              _.each(self.model.get('tutorial').get('step').get('template_highlights'), function(highlight) {
                templateCode.markText(highlight.start, highlight.end, {
                  className: 'styled-background',
                  clearOnEnter: true
                });
              });
            }
            if (self.model.get('tutorial').get('step').get('js_highlights')) {
              _.each(self.model.get('tutorial').get('step').get('js_highlights'), function(highlight) {
                tungstenCode.markText(highlight.start, highlight.end, {
                  className: 'styled-background',
                  clearOnEnter: true
                });
              });
            }
            self.run();
            if (self.model.get('runOnKeyup')) {
              tungstenCode.on('change', debouncedRun);
              templateCode.on('change', debouncedRun);
            }
          }, 200);
        });
        if (self.model.get('tutorial').get('steps')) {
          // Start at the first step
          self.model.get('tutorial').get('steps').trigger('selectStep', self.model.get('tutorial').get('steps').at(0));
        } else {
          console.log('tutorial has no steps set');
        }

      });
      // Start with the first tutorial open
      this.model.get('tutorials').trigger('selectTutorial', this.model.get('tutorials').at(0));
    },
    childViews: {
      'js-tutorial-select': TutorialSelectView,
      'js-step-select': StepSelectView
    }
  });

  // Models and Collections
  var TutorialModel = Model.extend({
    relations: {
      steps: Collection.extend({
        model: Model.extend({
          defaults: {
            selected: false
          }
        })
      })
    }
  });
  var TutorialCollection = Collection.extend({
    model: TutorialModel
  });
  var AppModel = Model.extend({
    relations: {tutorials: TutorialCollection, tutorial: TutorialModel}
  });

  // Start app
  new AppView({
    el: '#appwrapper',
    template: compiledTemplates.app,
    model: new AppModel(window.data),
    dynamicInitialize: true
  });
}());
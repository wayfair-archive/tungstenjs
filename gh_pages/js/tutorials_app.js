(function(CodeMirror, _, tungsten) {
  'use strict';
  tungsten.plugins.event.all.forEach(tungsten.addEventPlugin);
  var runtimeObjects = [];
  tungsten.View.prototype._initialize = tungsten.View.prototype.initialize;
  tungsten.View.prototype.initialize = function(opts) {
    if (!opts.parentView && !this.tutorialObj) {
      runtimeObjects.push(this);
    }
    this._initialize(opts);
  };
  tungsten.Model.prototype._initialize = tungsten.Model.prototype.initialize;
  tungsten.Model.prototype.initialize = function(attributes, opts) {
    opts = opts || {};
    if (!this.tutorialObj) {
      runtimeObjects.push(this);
    }
    this._initialize(opts);
  };
  tungsten.Collection.prototype._initialize = tungsten.Collection.prototype.initialize;
  tungsten.Collection.prototype.initialize = function(models, opts) {
    opts = opts || {};
    if (!this.tutorialObj) {
      runtimeObjects.push(this);
    }
    this._initialize(opts);
  };

  var View = tungsten.View.extend({
    initDebug: _.noop,
    _setElement: tungsten.Backbone.View.prototype._setElement,
    tutorialObj: true
  });
  var Model = tungsten.Model.extend({
    initDebug: _.noop,
    tutorialObj: true
  });
  var Collection = tungsten.Collection.extend({
    initDebug: _.noop,
    tutorialObj: true
  });
  var ComponentWidget = tungsten.ComponentWidget;

  // Code Mirror Extensions and options
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

  var codeOptions = {
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
  };

  // Views and Template
  var rawTemplates = {
    app: '<div class="pure-g js-main"> {{#tutorial}} <div class="pure-u-1-2 page-section description"> <ol class="steps"> {{#steps}} <li class="js-step-select pure-button {{#selected}}pure-button-active{{/selected}}">{{{index}}}</li> {{/steps}} </ol> <button class="pure-button js-run run" id="run">Run</button>{{#step}} <hr/><h4 class="step_name">{{name}}</h4><div class="step_description">{{{description_html}}}{{#solution_html}}<button class="pure-button">Show Solution</button><div class="solution">{{{.}}}</div>{{/solution_html}}</div> {{/step}} </div> <div class="pure-u-1-2 page-section">{{{template}}}</div> <div class="pure-u-1-2 page-section"> <div id="result"> <div id="app"></div> </div> </div> <div class="last-editor-section pure-u-1-2 page-section">{{{js}}}</div> {{/tutorial}} </div>',
    codeMirror: ''
  };
  var compiledTemplates = tungsten._template.compileTemplates(rawTemplates);

  var CodeMirrorComponent = {
    View: View.extend({
      events: {
        'keyup': 'quietUpdate',
        'input': 'quietUpdate'
      },
      postInitialize: function() {
        this.listenTo(this.model, 'change:clean_value', function(model, value) {
          this.codeMirror.setValue(value);
          this.setHighlights();
          this.codeMirror.setCursor(0, 0);
          // Scrolling once doesn't seem to register with the scroll bar
          this.codeMirror.scrollTo(0, 1);
          this.codeMirror.scrollTo(0, 0);
        });
        this.listenTo(this.model, 'change:highlights', this.setHighlights);
      },
      setHighlights: function() {
        var codeMirror = this.codeMirror;
        // Clear all current marks
        _.invoke(codeMirror.getAllMarks(), 'clear');

        _.each(this.model.get('highlights'), function(highlight) {
          codeMirror.markText(highlight.start, highlight.end, {
            className: 'styled-background',
            clearOnEnter: true
          });
        });
      },
      quietUpdate: function() {
        this.model.set('value', this.codeMirror.getValue(), {silent: true});
      },
      update: function() {
        this.model.set('value', this.codeMirror.getValue());
        // Fire a manual change event as well since value might not change
        this.model.trigger('change', this.model);
      },
      postRender: function() {
        var self = this;
        if (!this.codeMirror) {
          setTimeout(function() {
            self.codeMirror = CodeMirror(self.el, _.extend({
              value: self.model.get('clean_value'),
              mode: self.model.get('mode')
            }, codeOptions));
            self.setHighlights();
          });
        }
      }
    }, {debugName: 'CodeMirrorComponentView'}),
    Model: Model.extend({
      exposedEvents: ['change'],
      serialize: function(data) {
        return data.value.replace(/``/g, '');
      },
      derived: {
        highlights: {
          deps: ['value'],
          fn: function() {
            var codeMirrorHighlights = [];
            var value = this.get('value') || '';
            var highlights = [];
            var lines = value.split(/\r?\n/);
            for (var line = 0; line < lines.length; line++) {
              var cleanedLine = '';
              var lineStr = lines[line];
              var offset = 0;
              for (var ch = 0; ch < lineStr.length; ch++) {
                if (lineStr.charAt(ch) === '`' && lineStr.charAt(ch + 1) === '`') {
                  highlights.push({ line: line, ch: ch - offset });
                  offset += 2;
                  ch += 1;
                } else {
                  cleanedLine += lineStr.charAt(ch);
                }
              }
            }

            var l = highlights.length - (highlights.length % 2);
            for (var i = 0; i < l; i += 2) {
              codeMirrorHighlights.push({
                start: highlights[i],
                end: highlights[i + 1]
              });
            }

            return codeMirrorHighlights;
          }
        },
        clean_value: {
          deps: ['value'],
          fn: function() {
            return this.get('value').replace(/``/g, '');
          }
        }
      }
    }, {debugName: 'CodeMirrorComponentModel'}),
    template: compiledTemplates.codeMirror,
    constructor: function(data, options) {
      if (data && data.constructor === ComponentWidget) {
        return data;
      }
      return new ComponentWidget(
        CodeMirrorComponent.View,
        new CodeMirrorComponent.Model(data),
        CodeMirrorComponent.template,
        options
      );
    }
  };

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
      var boilerplate = 'var rawTemplates = { app_view: ' + JSON.stringify(this.model.get('template').doSerialize()) + ' };var compiledTemplates = tungsten._template.compileTemplates(rawTemplates);';
      var evalNoContext = eval.bind(null);
      // Destroy any views that were created in the last run to ensure a fresh runtime
      _.invoke(runtimeObjects, 'stopListening');
      _.invoke(runtimeObjects, 'destroy');
      runtimeObjects = [];
      document.getElementById('app').innerHTML = '';
      try {
        evalNoContext(boilerplate + '\n;' + this.model.get('js').doSerialize());
      } catch (e) {
        document.getElementById('app').innerHTML = '<br><span style="color: red;">ERROR: ' + e.toString() + '</span>';
      }
    },
    toggleFold: function(cm, fold) {
      cm.operation(function() {
        for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) {
          cm.foldCode({line: l, ch: 0}, null, fold ? 'fold' : unfold);
        }
      });
    },
    postInitialize: function() {
      var self = this;
      var debouncedRun = _.debounce(this.run, 200);
      this.listenTo(this.model, 'change:js change:template', debouncedRun);

      this.listenTo(this.model.get('tutorials'), 'selectTutorial', _.debounce(function(tutorialName) {
        var tutorial = self.model.get('tutorials').where({name: tutorialName})[0];
        self.model.unset('step');
        self.model.unset('tutorial');

        self.model.get('tutorials').each(function(tutorials) {
          tutorials.set('selected', false);
        });
        tutorial.set('selected', true);

        self.model.set('tutorial', tutorial.toJSON());
        self.listenTo(self.model.get('tutorial').get('steps'), 'selectStep', function(s) {
          if (s.get('selected') === true) {
            return;
          }
          self.model.get('tutorial').get('steps').each(function(step) {
            step.set('selected', false);
          });
          s.set('selected', true);
          self.model.get('tutorial').set('step', s);
          var appEl = document.getElementById('app');
          if (appEl) {
            appEl.innerHTML = '';
          }
        });
        if (self.model.get('tutorial').get('steps')) {
          // Start at the first step
          self.model.get('tutorial').get('steps').trigger('selectStep', self.model.get('tutorial').get('steps').at(0));
        } else {
          console.log('tutorial has no steps set');
        }

      }, 0));
      // Start with the first tutorial open
      this.model.get('tutorials').trigger('selectTutorial', this.model.get('tutorials').at(0).get('name'));
    },
    childViews: {
      'js-step-select': StepSelectView
    }
  });

  // Models and Collections
  var TutorialModel = Model.extend({
    derived: {
      url_name: {
        deps: ['name'],
        fn: function() {
          return encodeURI(this.get('name'));
        }
      }
    },
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
    defaults: {
      js: { mode: 'javascript', value: '' },
      template: { mode: 'mustache', value: '' }
    },
    relations: {
      js: CodeMirrorComponent.constructor,
      template: CodeMirrorComponent.constructor,
      tutorials: TutorialCollection,
      tutorial: TutorialModel
    },
    postInitialize: function() {
      this.listenTo(this, 'change:tutorial change:tutorial:step', function() {
        this.get('js').set({
          value: this.getDeep('tutorial:step:js') || ''
        });
        this.get('template').set({
          value: this.getDeep('tutorial:step:template') || ''
        });
      });
    }
  });
  var appModel = new AppModel(window.data);

  // Start app
  var app = window.app = new AppView({
    el: document.getElementById('appwrapper'),
    template: compiledTemplates.app,
    model: appModel,
    dynamicInitialize: true
  });
  window.app = app;

  if (!tungsten.Backbone.history.started) {
    var Router = tungsten.Backbone.Router.extend({
      routes: {
        '*tutorialName': 'selectTutorial'
      },
      selectTutorial: function(tutorialName) {
        if (tutorialName) {
          appModel.get('tutorials').trigger('selectTutorial', tutorialName);
        }
      }
    });
    new Router();
    tungsten.Backbone.history.start();
  }


})(CodeMirror, _, tungsten);

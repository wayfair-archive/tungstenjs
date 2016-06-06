(function(CodeMirror, _, tungsten, helpers) {
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

  helpers.initMustacheCode(CodeMirror);

  var codeOptions = helpers.codeOptions;

  // Views and Template
  var rawTemplates = {
    app:
    '<div class="pure-g js-main">' +
        '<div class="pure-u-1-2 page-section"><div class="page-section"><div class="sandbox_section">{{{template}}}</div></div><div class="page-section"><div class="sandbox_section">{{{js}}}</div></div></div>' +
        '<div class="pure-u-1-2 page-section sandbox"><button class="pure-button js-run run sandbox_button" id="run">Run</button> <div id="result"> <div id="app"></div> </div></div>' +
    '</div>',
    codeMirror: ''
  };
  var compiledTemplates = tungsten.templateHelper.compileTemplates(rawTemplates);

  var CodeMirrorComponent = {
    View: View.extend({
      events: {
        'keyup': 'quietUpdate',
        'input': 'quietUpdate'
      },
      postInitialize: function() {
        this.listenTo(this.model, 'change:value', function(model, value) {
          this.codeMirror.setValue(value);
          this.setHighlights();
          this.codeMirror.setCursor(0, 0);
          // Scrolling once doesn't seem to register with the scroll bar
          this.codeMirror.scrollTo(0, 1);
          this.codeMirror.scrollTo(0, 0);
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
              value: self.model.get('value'),
              mode: self.model.get('mode')
            }, codeOptions));
          });
        }
      }
    }, {debugName: 'CodeMirrorComponentView'}),
    Model: Model.extend({
      exposedEvents: ['change'],
      serialize: function(data) {
        return data.value.replace(/``/g, '');
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

  var AppView = View.extend({
    events: {
      'click .js-run': 'run',
      'keydown': 'handleKeydown'
    },
    handleKeydown: helpers.editorKeydown,
    run: function() {
      var boilerplate = 'var rawTemplates = { app_view: ' + JSON.stringify(this.model.get('template').doSerialize()) + ' };var compiledTemplates = tungsten.templateHelper.compileTemplates(rawTemplates);';
      var evalNoContext = eval.bind(null);
      // Destroy any views that were created in the last run to ensure a fresh runtime
      _.invoke(runtimeObjects, 'stopListening');
      _.invoke(runtimeObjects, 'destroy');
      runtimeObjects = [];
      document.getElementById('app').innerHTML = '';
      try {
        evalNoContext(boilerplate + '\n;' + this.model.get('js').doSerialize());
        var templateStr = this.model.get('template') ? 't=' + btoa(this.model.get('template').doSerialize()) : '';
        var jsStr = this.model.get('js') ? 'js=' + btoa(this.model.get('js').doSerialize()) : '';
        var sandboxPage = 'sandbox.html';
        window.history.pushState({}, window.document.title, window.location.href.substr(0, window.location.href.indexOf(sandboxPage))+ sandboxPage + '?' + jsStr + '&' + templateStr);
      } catch (e) {
        document.getElementById('app').innerHTML = '<br><span style="color: red;">ERROR: ' + e.toString() + '</span>';
      }
    },
    toggleFold: helpers.toggleFold,
    postInitialize: function() {
      var self = this;
      var debouncedRun = _.debounce(this.run, 200);
      this.listenTo(this.model, 'change:js change:template', debouncedRun);
      self.model.get('sandbox').set('js', this.model.get('js'));
      self.model.get('sandbox').set('template', this.model.get('template'));
    }
  });


  var AppModel = Model.extend({
    relations: {
      js: CodeMirrorComponent.constructor,
      template: CodeMirrorComponent.constructor,
      sandbox: Model
    }
  });

  var urlParams = _.object(_.compact(_.map(location.search.slice(1).split('&'), function(item) {  if (item) return item.split('='); })));

  var appModel = new AppModel({
    sandbox: {js: '', template: ''},
    js: { mode: 'javascript', value:  urlParams.js ? atob(urlParams.js) : "var BaseView = tungsten.View, BaseModel = tungsten.Model, BaseCollection = tungsten.Collection;\nnew BaseView({\n  el: document.getElementById('app'),\n  template: compiledTemplates.app_view,\n  model: new BaseModel({name: 'world'}),\n  dynamicInitialize: true \n});" },
    template: { mode: 'mustache', value: urlParams.t ? atob(urlParams.t) : '<div>Hello, {{name}}</div>' }
  });

  // Start app
  var app = new AppView({
    el: document.getElementById('appwrapper'),
    template: compiledTemplates.app,
    model: appModel,
    dynamicInitialize: true
  });


})(CodeMirror, _, tungsten, helpers);

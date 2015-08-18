/**
 * Base backbone view for vdom- see class declaration for more information
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var tungsten = require('../../src/tungsten');
var ViewWidget = require('./backbone_view_widget');

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

/**
 * Provides generic reusable methods that child views can inherit from
 */
var BaseView = Backbone.View.extend({
  /*
   * Default to an empty hash
   */
  eventOptions: {},
  /**
   * Shared init logic
   */
  initialize: function(options) {
    if (!this.el) {
      return false;
    }
    this.options = options || {};

    // Pass router through options, setting router.view if not already set
    if (this.options.router) {
      this.router = this.options.router;
      this.router.view = this.router.view || this;
    }
    // Template object
    if (this.options.template) {
      this.compiledTemplate = this.options.template;
    }
    // VTree is passable as an option if we are transitioning in from a different view
    if (this.options.vtree) {
      this.vtree = this.options.vtree;
    }
    // First-pass rendering context
    if (this.options.context) {
      this.context = this.options.context;
    }
    // Handle to the parent view
    if (this.options.parentView) {
      this.parentView = this.options.parentView;
    }

    var dataItem = this.serialize();

    // Sanity check that compiledTemplate exists and has a toVdom method
    if (this.compiledTemplate && this.compiledTemplate.toVdom) {
      // Run attachView with this instance to attach childView widget points
      this.compiledTemplate = this.compiledTemplate.attachView(this, ViewWidget);

      // If vtree was passed in, we're switching from another view and need to render
      if (this.options.vtree) {
        this.render();
      }
      if (this.options.dynamicInitialize) {
        // If dynamicInitialize is set, empty this.el and replace it with the rendered template
        while (this.el.firstChild) {
          this.el.removeChild(this.el.firstChild);
        }
        var tagName = this.el.tagName;
        this.vtree = tungsten.parseString('<' + tagName + '></' + tagName + '>');
        this.render();
      }

      // If the deferRender option was set, it means a layout manager / a module will control when this view is rendered
      if (!this.options.deferRender) {
        var self = this;
        self.vtree = self.vtree || self.compiledTemplate.toVdom(dataItem);
        self.initializeRenderListener(dataItem);
        if (this.options.dynamicInitialize || this.options.vtree) {
          // If certain options were set, render was already invoked, so childViews are attached
          self.postInitialize();
        } else {
          setTimeout(function() {
            self.attachChildViews();
            self.postInitialize();
          }, 1);
        }
      } else {
        this.initializeRenderListener(dataItem);
        this.postInitialize();
      }
    } else {
      this.initializeRenderListener(dataItem);
      this.postInitialize();
    }
  },
  tungstenViewInstance: true,
  debouncer: null,
  initializeRenderListener: function(dataItem) {
    // If this has a model and is the top level view, set up the listener for rendering
    if (dataItem && (dataItem.tungstenModel || dataItem.tungstenCollection)) {
      var runOnChange;
      var self = this;
      if (!this.parentView) {
        runOnChange = _.bind(this.render, this);
      } else if (!dataItem.parentProp && this.parentView.model !== dataItem) {
        // If this model was not set up via relation, manually trigger an event on the parent's model to kick one off
        runOnChange = function() {
          // trigger event on parent to start a render
          self.parentView.model.trigger('render');
        };
      }
      if (runOnChange) {
        this.listenTo(dataItem, 'all', function() {
          // Since we're attaching a very naive listener, we may get many events in sequence, so we set a small debounce
          clearTimeout(self.debouncer);
          self.debouncer = setTimeout(runOnChange, 1);
        });
      }
    }
  },

  /**
   * This function is run once we are done initializing the view.
   * Currently unimplemented. Child views should override this if they would like to use it.
   */
  postInitialize: function() {},

  /**
   * Lets the child view dictate what to pass into the template as context. If not overriden, then it will simply use the default
   * model.attributes or collection.toJSON
   *
   * @return {Object} model.attributes or collection.toJSON()
   */
  serialize: function() {
    return this.model || this.collection || {};
  },

  /**
   * Override of the base Backbone function
   * @param  {Object?} events  Event object o bind to. Falls back to this.events
   */
  delegateEvents: function(events) {
    if (!this.el) {
      return;
    }
    if (!(events || (events = _.result(this, 'events')))) {
      return;
    }
    var self = this;
    setTimeout(function() {
      // Unbind any current events
      self.undelegateEvents();
      // Get any options that may  have been set
      var eventOptions = _.result(self, 'eventOptions');
      // Event / selector strings
      var keys = _.keys(events);
      var key;
      // Create an array to hold the information to detach events
      self.eventsToRemove = new Array(keys.length);
      for (var i = keys.length; i--;) {
        key = keys[i];
        // Sanity check that value maps to a function
        var method = events[key];
        if (!_.isFunction(method)) {
          method = self[events[key]];
        }
        if (!method) {
          throw new Error('Method "' + events[key] + '" does not exist');
        }
        var match = key.match(delegateEventSplitter);
        var eventName = match[1],
          selector = match[2];
        method = _.bind(method, self);

        // throws an error if invalid
        self.eventsToRemove[i] = tungsten.bindEvent(self.el, eventName, selector, method, eventOptions[key]);
      }
    }, 1);
  },

  /**
   * Override of the base Backbone function
   */
  undelegateEvents: function() {
    if (!this.el) {
      return;
    }
    // Uses array created in delegateEvents to unbind events
    if (this.eventsToRemove) {
      for (var i = 0; i < this.eventsToRemove.length; i++) {
        tungsten.unbindEvent(this.eventsToRemove[i]);
      }
      this.eventsToRemove = null;
    }
  },

  /**
   * Generic view rendering function that renders the view's compiled template using its model
   * @return {Object} the view itself for chainability
   */
  render: function() {
    if (!this.compiledTemplate) {
      return;
    }

    // let the view have a say in what context to pass to the template
    // defaults to an empty object for context so that our view render won't fail
    var serializedModel = this.context || this.serialize();
    var initialTree = this.vtree || this.compiledTemplate.toVdom(this.serialize());
    this.vtree = tungsten.updateTree(this.el, initialTree, this.compiledTemplate.toVdom(serializedModel));

    // Clear any passed context
    this.context = null;

    // good to know when the view is rendered
    this.trigger('rendered');
    this.postRender();

    return this;
  },

  /**
   * This function is run once we are done rendering the view.
   * Currently unimplemented. Child views should override this if they would like to use it.
   */
  postRender: function() {},

  /**
   * Updates the function with a new model and template
   * @param  {Object}  newModel     Model to update to
   */
  update: function(newModel) {
    // Track if anything has changed in order to trigger a render
    if (newModel !== this.model) {
      // If the model has changed, change listener to new model
      this.stopListening(this.model);
      this.model = newModel;
      this.initializeRenderListener(newModel);
    }
    this.render();
  },

  /**
   * Parse this.vtree for childViews
   * This ensures DOM order and only gets the list on demand rather than each render cycle
   * @return {Array<Object>} DOM order array of child views
   */
  getChildViews: function() {
    var childInstances = [];

    var recurse = function(vnode) {
      var child;
      for (var i = 0; i < vnode.children.length; i++) {
        child = vnode.children[i];
        if (child.type === 'VirtualNode' && child.hasWidgets) {
          recurse(child);
        } else if (child.type === 'Widget' && child.view) {
          childInstances.push(child.view);
        }
      }
    };
    recurse(this.vtree);

    return childInstances;
  },

  /**
   * Parse this.vtree for childViews and attach them to the DOM node
   * Used during initialization where a render is unnecessary
   */
  attachChildViews: function() {
    var recurse = function(vnode, elem) {
      if (!elem) {
        return;
      }
      var child;
      for (var i = 0; i < vnode.children.length; i++) {
        child = vnode.children[i];
        if (child.type === 'VirtualNode' && child.hasWidgets) {
          recurse(child, elem.childNodes[i]);
        } else if (child.type === 'Widget' && !child.view && typeof child.attach === 'function') {
          child.attach(elem.childNodes[i]);
        }
      }
    };
    recurse(this.vtree, this.el);
  },

  /**
   * Removes model listeners and DOM events from this and all child views
   */
  destroy: function() {
    clearTimeout(this.debouncer);
    this.stopListening();
    this.undelegateEvents();
    var childInstances = this.getChildViews();
    for (var i = 0; i < childInstances.length; i++) {
      childInstances[i].destroy();
    }
  },
  setNestedData: function(prop, data) {
    var model = this.model.getDeep(prop);
    model.set(data);
  },
  setSubview: function(prop, data, Template, View, Model) {
    var model = this.model;
    var propParts = prop.split(':');
    prop = propParts.splice(-1);
    prop = prop[0];
    if (propParts.length) {
      model = model.getDeep(propParts.join(':'));
    }
    var subview;
    if (View && View.tungstenView && (data.tungstenModel || Model)) {
      Template = Template.wrap('span');
      Template.wrapped = true;

      var subModel;
      if (data.tungstenModel) {
        subModel = data;
      } else if (Model) {
        subModel = new Model(data);
      }

      subview = {
        is_tungsten_component: true,
        template: Template,
        model: subModel,
        view: View,
        instance: _.uniqueId('w_subview')
      };
    } else {
      subview = {
        is_subview: true,
        template: Template,
        data: data
      };
    }

    model.set(prop, subview);
  },
  clearSubview: function(prop) {
    var model = this.model;
    var propParts = prop.split(':');
    prop = propParts.splice(-1);
    prop = prop[0];
    if (propParts.length) {
      model = model.getDeep(propParts.join(':'));
    }
    model.unset(prop);
  }
}, {
  tungstenView: true
});

module.exports = BaseView;

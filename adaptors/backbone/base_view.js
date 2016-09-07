/**
 * Base backbone view for vdom- see class declaration for more information
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';
var _ = require('underscore');
var Backbone = require('backbone');
var tungsten = require('../../src/tungsten');
var errors = require('../../src/utils/errors');
var ViewWidget = require('./backbone_view_widget');
var ComponentWidget = require('./component_widget');

var renderQueue = require('../shared/render_queue');
var validate = require('../shared/validate');

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
  renderEvents: 'all',
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
    // Indicator that this is the view of a component
    if (this.options.isComponentView) {
      this.isComponentView = this.options.isComponentView;
    }

    if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
      this.initDebug();
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
        this.vtree = this.vtree || this.compiledTemplate.toVdom(dataItem);
        this.initializeRenderListener(dataItem);
        if (this.options.dynamicInitialize || this.options.vtree) {
          // If certain options were set, render was already invoked, so childViews are attached
          this.postInitialize();
          this.trigger('initialized');
          if (!this.options.dynamicInitialize) {
            this.validateVdom();
          }
        } else {
          setTimeout(() => {
            this.attachChildViews(() => {
              // Wait until all children are attached before calling postInitialize
              this.postInitialize();
              this.trigger('initialized');
              this.validateVdom();
            });
          }, 1);
        }
      } else {
        this.initializeRenderListener(dataItem);
        this.postInitialize();
        this.trigger('initialized');
      }
    } else {
      this.initializeRenderListener(dataItem);
      this.postInitialize();
      this.trigger('initialized');
    }

  },
  tungstenViewInstance: true,
  debouncer: null,
  initializeRenderListener: function(dataItem) {
    // If this has a model and is the top level view, set up the listener for rendering
    if (dataItem && (dataItem.tungstenModel || dataItem.tungstenCollection)) {
      var runOnChange;
      if (!this.parentView) {
        var boundRender = _.bind(this.render, this);
        runOnChange = () => {
          renderQueue.queue(this, boundRender);
        };
      } else if (!dataItem.collection && !dataItem.parentProp && this.parentView.model !== dataItem) {
        // If this model was not set up via relation, manually trigger an event on the parent's model to kick one off
        runOnChange = () => {
          // trigger event on parent to start a render
          this.parentView.model.trigger('render');
        };
      }
      if (runOnChange) {
        this.listenTo(dataItem, this.renderEvents, () => {
          // Since we're attaching a very naive listener, we may get many events in sequence, so we set a small debounce
          clearTimeout(this.debouncer);
          this.debouncer = setTimeout(runOnChange, 1);
        });
      }
    }
  },

  /**
   * This function is run once we are done initializing the view.
   * Currently unimplemented. Child views should override this if they would like to use it.
   */
  postInitialize: function() {},

  updateVtree: function() {
    if (this.childViews && _.size(this.childViews) > 0) {
      throw 'Views with childViews cannot be updated with this method.';
    }
    this.vtree = this.compiledTemplate.toVdom(this.serialize());
  },

  validateVdom: function() {
    // If the vtree or element hasn't been set for any reason, bail out of validation
    if (!this.vtree || !this.vtree.children || !this.el || !this.el.childNodes) {
      return;
    }
    var isText = function(node) {
      return node && (typeof node === 'string' || node.type === 'VirtualText');
    };

    // If there's a mismatch in childNode counts, it's usually extra whitespace from the server
    // We can trim those off so that the VTree is unaffected during lookups
    // Since this is in the form of whitespace around the template, it's a simple type check on the first and last node
    if (this.vtree.children.length !== this.el.childNodes.length) {
      // If the first part of the template is a string or the first node isn't a textNode, assume that's fine
      if (!isText(this.vtree.children[0]) && this.el.childNodes[0] && this.el.childNodes[0].nodeType === 3) {
        this.el.removeChild(this.el.childNodes[0]);
      }
      // If the last part of the template is a string or the last node isn't a textNode, assume that's fine
      var lastNode = this.el.childNodes[this.el.childNodes.length - 1];
      if (!isText(this.vtree.children[this.vtree.children.length - 1]) && lastNode && lastNode.nodeType === 3) {
        this.el.removeChild(lastNode);
      }
    }
    if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
      // Compare full template against full DOM
      var diff = this.getTemplateDiff();
      if (diff.indexOf('<ins>') + diff.indexOf('<del>') > -2) {
        errors.domDoesNotMatchVDOMForView(this.getDebugName());
      }
    }
  },

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
    setTimeout(() => {
      // Unbind any current events
      this.undelegateEvents();
      // Get any options that may  have been set
      var eventOptions = _.result(this, 'eventOptions');
      // Event / selector strings
      var keys = _.keys(events);
      var key;
      // Create an array to hold the information to detach events
      this.eventsToRemove = new Array(keys.length);
      for (var i = keys.length; i--;) {
        key = keys[i];
        // Sanity check that value maps to a function
        var method = events[key];
        if (!_.isFunction(method)) {
          method = this[events[key]];
        }
        if (!method) {
          throw new Error('Method "' + events[key] + '" does not exist');
        }
        var match = key.match(delegateEventSplitter);
        var eventName = match[1],
          selector = match[2];
        method = _.bind(method, this);

        // throws an error if invalid
        this.eventsToRemove[i] = tungsten.bindEvent(this.el, eventName, selector, method, eventOptions[key]);
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
        if (typeof this.eventsToRemove[i] !== 'undefined') {
          tungsten.unbindEvent(this.eventsToRemove[i]);
        }
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
    var initialTree = this.vtree || this.compiledTemplate.toVdom(this.serialize(), true);
    var result = tungsten.updateTree(this.el, initialTree, this.compiledTemplate.toVdom(serializedModel));
    this.vtree = result.vtree;
    if (result.elem !== this.el) {
      this.setElement(result.elem);
    }

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
        } else if (child.type === 'Widget') {
          if (child.view) {
            childInstances.push(child.view);
          } else if (child.vtree) {
            recurse(child.vtree);
          }
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
  attachChildViews: function(callback) {
    // start at one so that if all children initialize synchronously, it still won't fire
    var numChildren = 1;
    var attachedChildren = 0;
    // listener to count up initialized children and call back once complete
    var childInitialized = function() {
      attachedChildren = attachedChildren + 1;
      if (attachedChildren === numChildren) {
        callback();
      }
    };

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
          // Increment child count and set listener
          numChildren = numChildren + 1;
          child.view.listenTo(child.view, 'initialized', childInitialized);
        }
      }
    };
    recurse(this.vtree, this.el);

    // once all children have been processed invoke listener to account for initial difference
    childInitialized();
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

      subview = new ComponentWidget(View, subModel, Template, _.uniqueId('w_subview'));
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
  tungstenView: true,
  extend: function(protoProps, staticProps) {
    if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
      // Certain methods of BaseView should be unable to be overridden
      var methods = ['initialize', 'render', 'delegateEvents', 'undelegateEvents'];

      var wrapOverride = function(first, second) {
        return function() {
          first.apply(this, arguments);
          second.apply(this, arguments);
        };
      };

      for (var i = 0; i < methods.length; i++) {
        if (protoProps[methods[i]]) {
          if (staticProps && staticProps.debugName) {
            errors.viewMethodMayNotBeOverridden(methods[i], staticProps.debugName);
          } else {
            errors.viewMethodMayNotBeOverridden(methods[i]);
          }
          // Replace attempted override with base version
          protoProps[methods[i]] = wrapOverride(BaseView.prototype[methods[i]], protoProps[methods[i]]);
        }
      }
    }

    if (protoProps && protoProps.childViews) {
      validate.childViews(protoProps.childViews);
    }

    return Backbone.View.extend.call(this, protoProps, staticProps);
  }
});
if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
  BaseView = BaseView.extend({
    /**
     * Bootstraps all debug functionality
     */
    initDebug: function() {
      tungsten.debug.registry.register(this);
      // These methods are often invoked oddly, so ensure their context
      _.bindAll(this, 'getEvents', 'getDebugName', 'getChildViews');
    },

    /**
     * Get a list of all trackable functions for this view instance
     * Ignores certain base and debugging functions
     *
     * @param  {Object}        trackedFunctions     Object to track state
     * @param  {Function}      getTrackableFunction Callback to get wrapper function
     *
     * @return {Array<Object>}                      List of trackable functions
     */
    getFunctions: function(trackedFunctions, getTrackableFunction) {
      // Debug functions shouldn't be debuggable
      var blacklist = {
        constructor: true,
        initialize: true,
        postInitialize: true,
        compiledTemplate: true,
        initDebug: true,
        getFunctions: true,
        getEvents: true,
        getVdomTemplate: true,
        getTemplateString: true,
        getChildren: true,
        getDebugName: true,
        toString: true
      };
      var getFunctions = require('../shared/get_functions');
      return getFunctions(trackedFunctions, getTrackableFunction, this, BaseView.prototype, blacklist);
    },

    _setElement: function(el) {
      var dataset = require('data-set');
      var data;
      if (this.el && this.el.tagName && this.el !== el) {
        data = dataset(this.el);
        data.view = null;
      }
      Backbone.View.prototype._setElement.call(this, el);
      data = dataset(this.el);
      data.view = this;
    },

    /**
     * Gets a JSON format version of the current state
     *
     * @return {Object|Array} Data of bound model or collection
     */
    getState: function() {
      var data = this.serialize();
      if (data && typeof data.doSerialize === 'function') {
        data = data.doSerialize();
      }
      return data;
    },

    /**
     * Sets the state to the given data
     * @param {Object|Array} data Object to set state to
     */
    setState: function(data) {
      var dataObj = this.serialize();
      if (typeof dataObj.reset === 'function') {
        dataObj.reset(data);
      } else if (typeof dataObj.set === 'function') {
        dataObj.set(data, {
          reset: true
        });
      }
      return data;
    },

    /**
     * Return a list of DOM events
     *
     * @return {Array<Object>} List of bound DOM events
     */
    getEvents: function() {
      var events = _.result(this, 'events');
      var eventKeys = _.keys(events);

      var result = new Array(eventKeys.length);
      for (var i = 0; i < eventKeys.length; i++) {
        result[i] = {
          selector: eventKeys[i],
          name: events[eventKeys[i]],
          fn: this[events[eventKeys[i]]]
        };
      }
      return result;
    },

    /**
     * Converts the current vtree to an HTML structure
     *
     * @return {string} HTML representation of VTree
     */
    getVdomTemplate: function() {
      var vtreeToRender = this.vtree;
      if (!this.parentView) {
        vtreeToRender = vtreeToRender.children;
      }
      return tungsten.debug.vtreeToString(vtreeToRender, true);
    },

    getTemplateString: function() {
      return this.compiledTemplate.toSource(true);
    },

    /**
     * Compares the current VTree and DOM structure and returns a diff
     *
     * @return {string} Diff of VTree vs DOM
     */
    getTemplateDiff: function() {
      if (!this.parentView) {
        var numChildren = Math.max(this.vtree.children.length, this.el.childNodes.length);
        var output = '';
        for (var i = 0; i < numChildren; i++) {
          output += tungsten.debug.diffVtreeAndElem(this.vtree.children[i], this.el.childNodes[i]);
        }
        return output;
      } else {
        return tungsten.debug.diffVtreeAndElem(this.vtree, this.el);
      }
    },

    /**
     * Gets children of this object
     *
     * @return {Array} Whether this object has children
     */
    getChildren: function() {
      if (this.getChildViews.original) {
        return this.getChildViews.original.call(this);
      } else {
        return this.getChildViews();
      }
    },

    /**
     * Debug name of this object, using declared debugName, falling back to cid
     *
     * @return {string} Debug name
     */
    getDebugName: function() {
      return this.constructor.debugName ? this.constructor.debugName + this.cid.replace('view', '') : this.cid;
    },

    toString: function() {
      return '[' + this.getDebugName() + ']';
    }
  });
}

module.exports = BaseView;

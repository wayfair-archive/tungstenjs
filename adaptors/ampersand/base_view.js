/**
 * Base backbone view for vdom- see class declaration for more information
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';
var _ = require('underscore');
var AmpersandView = require('ampersand-view');
var tungsten = require('../../src/tungsten');
var ViewWidget = require('./ampersand_view_widget');

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

/**
 * Provides generic reusable methods that child views can inherit from
 */
var BaseView = AmpersandView.extend({
  tungstenView: true,
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

    // Sanity check that template exists and has a toVdom method
    if (this.template && this.template.toVdom) {
      if (this.options.dynamicInitialize) {
        // If dynamicInitialize is set, empty this.el and replace it with the rendered template
        while (this.el.firstChild) {
          this.el.removeChild(this.el.firstChild);
        }
        this.el.appendChild(this.template.toDom(dataItem));
      }
      // Run attachView with this instance to attach childView widget points
      this.template = this.template.attachView(this, ViewWidget);

      // If the deferRender option was set, it means a layout manager / a module will control when this view is rendered
      if (!this.options.deferRender) {
        // Render the initial view
        this.render();
      }
    }

    this.initializeRenderListener(dataItem);
    this.postInitialize();
  },

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
      return this;
    }
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
      if (typeof method !== 'function') {
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
    if (!this.template) {
      return;
    }

    // let the view have a say in what context to pass to the template
    // defaults to an empty object for context so that our view render won't fail
    var serializedModel = this.context || this.serialize();
    var initialTree = this.vtree || this.template.toVdom(this.serialize(), true);
    this.vtree = tungsten.updateTree(this.el, initialTree, this.template.toVdom(serializedModel));

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
  }
});

BaseView.tungstenView = true;

module.exports = BaseView;

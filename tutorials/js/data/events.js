window.data = window.data || {};
window.data.tutorials = window.data.tutorials || [];
window.data.tutorials.push({
  name: 'Events',
  steps: [
    {
      name: 'Event Handling',
      index: 1,
      description_html: '<p>Events are defined with the standard <a href=""><code>events</code> hash</a> API when using the Backbone or Ampersand adaptor. If a selector is passed in the event key, however, it can only use a <code>js-</code> prefixed class selector. This optimizes performance when delegating events because under the hood, unlike Backbone or Ampersand, Tungsten.js provides its own event delegation system. By default, all events are delegated from the document. Special events can also be handled by an <a href="">event handler plugin</a>.</p><p>All common event types are supported as well as the special cases outlined in the examples in the following sections:</p><ul><li>Directional Swipe Events</li><li>Intent Events</li><li>Document Bindings</li><li>Window Bindings</li><li>Outside Events</li><li>Submit Data</li></ul>'
    },
    {
      name: 'Directional Swipe Events',
      index: 2,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      template: '<p>Test events in the colored area below.</p>\n<div class="js-event-area pure-u-1" style="height:300px; background-color:#71A3AF;"></div>\n<div>captured: {{message}}</div>',
      description_html: '<p>Exactly what it sounds like:</p><ul><li>swipeup</li><li>swipedown</li><li>swipeleft</li><li>swiperight</li></ul><p>In order to test this on a desktop browser, it might be necessary to put the browser dev tools into device mode to register swipes correctly.</p>',
      js: "var View = tungsten.backbone.View;\nvar Model = tungsten.backbone.Model;\n\nvar AppModel = Model.extend({\n  message: '---'\n});\n\nvar AppView = View.extend({\n  events: {\n    'swipeup .js-event-area': 'swipeUp',\n    'swipedown .js-event-area': 'swipeDown',\n    'swipeleft .js-event-area': 'swipeLeft',\n    'swiperight .js-event-area': 'swipeRight'\n  },\n  swipeUp: function() {\n    this.setEventMessage('swipeup');\n  },\n  swipeDown: function() {\n    this.setEventMessage('swipedown');\n  },\n  swipeLeft: function() {\n    this.setEventMessage('swipeleft');\n  },\n  swipeRight: function() {\n    this.setEventMessage('swiperight');\n  },\n  setEventMessage: function(msg) {\n    var self = this;\n    this.model.set('message', msg);\n    clearTimeout(this.messageTimeout);\n    this.messageTimeout = setTimeout(function() {\n      self.model.set('message', '---');\n    }, 1200);\n  }\n});\n\nnew AppView({\n  el: '#app',\n  template: compiledTemplates.app_view,\n  model: new AppModel(),\n  dynamicInitialize: true\n});"
    },
    {
      name: 'Intent Events',
      index: 3,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Limited to a subset of events that can be "cancelled". The handler will be called n milliseconds (default 200ms) after the initial event if it is not "cancelled"</p><p>Bindable by appending <code>-intent</code> to one of the following events and configurable using the eventOptions hash:</p><ul><li>mouseenter</li><li>mouseleave</li><li>mousedown</li><li>mouseup</li><li>keydown</li><li>keyup</li><li>touchstart</li><li>touchend</li></ul><p>In the following example, there are two regular events (<code>mouseenter</code>, <code>mousedown</code>) and two counterpart intent events (<code>mouseenter-intent</code>, <code>mousedown-intent</code>). If the mouse enters the event area, <code>mouseenter</code> will be triggered immediately. If the mouse remains in the event area (a <code>mouseleave</code> does not occur) for more than the time required to measure intent (200ms by default), then the <code>mouseenter-intent</code> event will fire. The scenario is similar for <code>mousedown</code> and <code>mousedown-intent</code>.</p>',
      template: '<p>Test events in the colored area below.</p>\n<div class="js-event-area pure-u-1" style="height:300px; background-color:#71A3AF;"></div>\n<div>captured: {{message}}</div>',
      js: "var View = tungsten.backbone.View;\nvar Model = tungsten.backbone.Model;\n\nvar AppModel = Model.extend({\n  message: '---'\n});\n\nvar AppView = View.extend({\n  events: {\n    'mouseenter .js-event-area': 'mouseenterEvent',\n    'mouseenter-intent .js-event-area': 'mouseenterIntent',\n    'mousedown .js-event-area': 'mousedownEvent',\n    'mousedown-intent .js-event-area': 'mousedownIntent'\n  },\n  mouseenterEvent: function(e) {\n    this.setEventMessage('mouseenter');\n  },\n  mouseenterIntent: function(e) {\n    this.setEventMessage('mouseenter INTENT');\n  },\n  mousedownEvent: function(e) {\n    this.setEventMessage('mousedown');\n  },\n  mousedownIntent: function(e) {\n    this.setEventMessage('mousedown INTENT');\n  },\n  setEventMessage: function(msg) {\n    var self = this;\n    this.model.set('message', msg);\n    clearTimeout(this.messageTimeout);\n    this.messageTimeout = setTimeout(function() {\n      self.model.set('message', '---');\n    }, 1200);\n  }\n});\n\nnew AppView({\n  el: '#app',\n  template: compiledTemplates.app_view,\n  model: new AppModel(),\n  dynamicInitialize: true\n});"
    },
    {
      name: 'Document Bindings',
      index: 4,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to the document with delegation still working as expected</p><ul><li>Bindable by prepending <code>doc-</code> to any event type</li></ul><p>In the example below, there are four events being listened to. <code>mousedown</code> and <code>mouseenter</code> are regular events, and <code>doc-mouseup</code> and <code>doc-mouseleave</code> are delegated to the document.</p><p>Test each of these events below and notice the delegate in the status line below the event area.</p>',
      template: '<p>Test events in the colored area below.</p>\n<div class="js-event-area pure-u-1" style="height:300px; background-color:#71A3AF;"></div>\n<div>captured: {{message}}</div>',
      js: "var AppView = View.extend({\n  events: {\n    'mousedown .js-event-area': 'mousedownEvent',\n    'doc-mouseup .js-event-area': 'mouseupDelegated',\n    'mouseenter .js-event-area': 'mouseenterEvent',\n    'doc-mouseleave .js-event-area': 'mouseleaveDelegated'\n  },\n  mousedownEvent: function(e) {\n    this.setEventMessage('mousedown | delegate: ' + e.delegateTarget.nodeName);\n  },\n  mouseupDelegated: function(e) {\n    this.setEventMessage('mouseup | delegate: ' + e.delegateTarget.nodeName);\n  },\n  mouseenterEvent: function(e) {\n    this.setEventMessage('mouseenter | delegate: ' + e.delegateTarget.nodeName);\n  },\n  mouseleaveDelegated: function(e) {\n    this.setEventMessage('mouseleave | delegate: ' + e.delegateTarget.nodeName);\n  },\n  setEventMessage: function(msg) {\n    var self = this;\n    this.model.set('message', msg);\n    clearTimeout(this.messageTimeout);\n    this.messageTimeout = setTimeout(function() {\n      self.model.set('message', '---');\n    }, 1200);\n  }\n});\n\nnew AppView({\n  el: '#app',\n  template: compiledTemplates.app_view,\n  model: new AppModel(),\n  dynamicInitialize: true\n});"
    },
    {
      name: 'Window Bindings',
      index: 5,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to the window</p><ul><li>Bindable by prepending <code>win-</code> to any event that the window fires (primarily scroll or resize, and height/width/scroll values are cached to prevent repeated reads)</li></ul>',
      template: '<p>Resize the window and see the event data below:</p>\n<div>captured: {{message}}</div>',
      js: "var View = tungsten.backbone.View;\nvar Model = tungsten.backbone.Model;\n\nvar AppModel = Model.extend({\n  message: '---'\n});\n\nvar AppView = View.extend({\n  events: {\n    'win-resize': 'winResize'\n  },\n  winResize: function(e) {\n    var w = e.current.width;\n    var h = e.current.height;\n    this.setEventMessage('resize (' + w + ',' + h + ')');\n  },\n  setEventMessage: function(msg) {\n    var self = this;\n    this.model.set('message', msg);\n    clearTimeout(this.messageTimeout);\n    this.messageTimeout = setTimeout(function() {\n      self.model.set('message', '---');\n    }, 1200);\n  }\n});\n\nnew AppView({\n  el: '#app',\n  template: compiledTemplates.app_view,\n  model: new AppModel(),\n  dynamicInitialize: true\n});"
    },
    {
      name: 'Outside Events',
      index: 6,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to events firing outside of the element</p><ul><li>Bindable by appending <code>-outside</code> to any event type</li></ul><p>In this example <code>swipeup-outside</code>, <code>swipedown-outside</code>, <code>mousedown-outside</code>, and <code>mouseup-outside</code> are shown. The <code>-outside</code> is in relation to the colored <code>.js-event-area</code>. If the listed events occur within the event area, the callbacks will not fire. They will only fire when triggered from outside the event area.</p>',
      template: '<p>Test events in the colored area below.</p>\n<div class="js-event-area pure-u-1" style="height:300px; background-color:#71A3AF;"></div>\n<div>captured: {{message}}</div>',
      js: "var View = tungsten.backbone.View;\nvar Model = tungsten.backbone.Model;\n\nvar AppModel = Model.extend({\n  message: '---'\n});\n\nvar AppView = View.extend({\n  events: {\n    'swipeup-outside .js-event-area': 'swipeupOutside',\n    'swipeup-outside .js-event-area': 'swipedownOutside',\n    'mousedown-outside .js-event-area': 'mousedownOutside',\n    'mouseup-outside .js-event-area': 'mouseupOutside'\n  },\n  swipeupOutside: function() {\n    this.setEventMessage('swipeup OUTSIDE');\n  },\n  swipedownOutside: function() {\n    this.setEventMessage('swipedown OUTSIDE');\n  },\n  mousedownOutside: function() {\n    this.setEventMessage('mousedown OUTSIDE');\n  },\n  mouseupOutside: function() {\n    this.setEventMessage('mouseup OUTSIDE');\n  },\n  setEventMessage: function(msg) {\n    var self = this;\n    this.model.set('message', msg);\n    clearTimeout(this.messageTimeout);\n    this.messageTimeout = setTimeout(function() {\n      self.model.set('message', '---');\n    }, 1200);\n  }\n});\n\nnew AppView({\n  el: '#app',\n  template: compiledTemplates.app_view,\n  model: new AppModel(),\n  dynamicInitialize: true\n});"
    },
    {
      name: 'Submit Data',
      index: 7,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to form submit events with the form\'s serialized data passed as the second parameter of the callback (uses <a href="https://github.com/defunctzombie/form-serialize">form-serialize</a>)</p><ul><li>Bindable by using the <code>submit-data</code> event type</li></ul><p>This example has a short form bound with the <code>submit-data</code> event. This will fire a callback when the form is submitted with the serialized data. Here we are just printing out the data but we could instead do form validation and/or status messaging.</p>',
      template: '<form class="js-event-form pure-form">\n    <input type="text" name="name" placeholder="Name" value=""/>\n    <input type="text" name="email" placeholder="Email" value=""/>\n    <input class="pure-button pure-button-primary" type="submit" value="Submit"/>\n</form>\n<br>\n<div>submitted: {{data}}</div>',
      js: "var View = tungsten.backbone.View;\nvar Model = tungsten.backbone.Model;\n\nvar AppModel = Model.extend({\n  data: '---'\n});\n\nvar AppView = View.extend({\n  events: {\n    'submit-data .js-event-form': 'formSubmit'\n  },\n  formSubmit: function(e, data) {\n    e.preventDefault();\n    this.setEventMessage(JSON.stringify(data));\n  },\n  setEventMessage: function(data) {\n    var self = this;\n    this.model.set('data', 'submitted: ' + data);\n    clearTimeout(this.messageTimeout);\n    this.messageTimeout = setTimeout(function() {\n      self.model.set('data', '---');\n    }, 4000);\n  }\n});\n\nnew AppView({\n  el: '#app',\n  template: compiledTemplates.app_view,\n  model: new AppModel(),\n  dynamicInitialize: true\n});"
    }
  ]
});

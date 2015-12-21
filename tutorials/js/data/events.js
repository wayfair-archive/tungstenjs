window.data = window.data || {};
window.data.tutorials = window.data.tutorials || [];
window.data.tutorials.push({
  name: 'Events',
  steps: [
    {
      name: 'Directional Swipe Event',
      index: 1,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Exactly what it sounds like:</p><ul><li>swipeup</li><li>swipedown</li><li>swipeleft</li><li>swiperight</li></ul>',
      template: '<p>Test swipe events in the colored area below.</p><div class="js-swipe-area pure-u-1" style="height:300px; background-color:#71A3AF;">{{icon}}</div><div>{{message}}</div>',
      js: "var View = tungsten.backbone.View;\nvar Model = tungsten.backbone.Model;\n\nvar AppModel = Model.extend({\n  message: 'captured: <none>',\n});\n\nvar AppView = View.extend({\n  events: {\n    'swipeup .js-swipe-area': 'swipeUp',\n    'swipedown .js-swipe-area': 'swipeDown',\n    'swipeleft .js-swipe-area': 'swipeLeft',\n    'swiperight .js-swipe-area': 'swipeRight'\n  },\n  swipeUp: function() {\n    this.model.set('message', 'captured: swipeup');\n  },\n  swipeDown: function() {\n    this.model.set('message', 'captured: swipedown');\n  },\n  swipeLeft: function() {\n    this.model.set('message', 'captured: swipeleft');\n  },\n  swipeRight: function() {\n    this.model.set('message', 'captured: swiperight');\n  }\n});\n\nnew AppView({\n  el: '#app',\n  template: compiledTemplates.app_view,\n  model: new AppModel(),\n  dynamicInitialize: true\n});"
    },
    {
      name: 'Intent Events',
      index: 2,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Limited to a subset of events that can be "cancelled". The handler will be called n milliseconds (default 200ms) after the initial event if it is not "cancelled"</p><p>Bindable by appending <code>-intent</code> to one of the following events and configurable using the eventOptions hash:</p><ul><li>mouseenter</li><li>mouseleave</li><li>mousedown</li><li>mouseup</li><li>keydown</li><li>keyup</li><li>touchstart</li><li>touchend</li></ul>',
      template: 'tpl',
      js: "var a = 'a';"
    },
    {
      name: 'Document Bindings',
      index: 3,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to the document with delegation still working as expected</p><ul><li>Bindable by prepending <code>doc-</code> to any event type</li></ul>',
      template: 'tpl',
      js: "var a = 'a';"
    },
    {
      name: 'Window Bindings',
      index: 4,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to the window</p><ul><li>Bindable by prepending <code>win-</code> to any event that the window fires (primarily scroll or resize, and height/width/scroll values are cached to prevent repeated reads)</li></ul>',
      template: 'tpl',
      js: "var a = 'a';"
    },
    {
      name: 'Outside Events',
      index: 5,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to events firing outside of the element</p><ul><li>Bindable by appending <code>-outside</code> to any event type</li></ul>',
      template: 'tpl',
      js: "var a = 'a';"
    },
    {
      name: 'Submit Data',
      index: 6,
      // template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Adds an event binding to form submit events with the form\'s serialized data passed as the second parameter of the callback (uses <a href="https://github.com/defunctzombie/form-serialize">form-serialize</a>)</p><ul><li>Bindable by using the <code>submit-data</code> event type</li></ul>',
      template: 'tpl',
      js: "var a = 'a';"
    }
  ]
});

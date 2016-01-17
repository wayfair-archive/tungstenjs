window.data = window.data || {};
window.data.tutorials = window.data.tutorials || [];
window.data.tutorials.push({
  name: 'Components',
  steps: [
    {
      name: 'Components',
      index: 1,
      js_highlights: [{start: {line: 13, ch: 28}, end: {line: 13, ch: 30}}],
      description_html: '<p>Components allow standalone Tungsten.js "apps" to be reused and composed to build larger applications. A component consists of a view, a model with data, and a template. To create a component, use the Component widget on the adaptor module (currently components are only available for the Backbone adaptor).</p><p>Add a <code>relations</code> hash to the app model to render the component at <code>{{{my_component}}}</code>.</p>',
      template: '<div>\n  <span>Component:</span><br>\n  <strong>{{{my_component}}}</strong>\n</div>',
      js: "var View = tungsten.View, Model = tungsten.Model, ComponentWidget = tungsten.ComponentWidget;\n\nvar ComponentView = View.extend({});\nvar ComponentModel = Model.extend({});\nvar componentTemplate = tungsten._template.compileTemplates({template: '<div>Hello {{name}}.</div>'});\n\nvar MyComponent = function(data, options) {\n  if (data && data.constructor === ComponentWidget) {\n    return data;\n  }\n  return new ComponentWidget(ComponentView, new ComponentModel(data), componentTemplate.template, options);\n};\n\nvar AppModel = Model.extend({});\n\nnew View({\n  el: document.getElementById('app'),\n  template: compiledTemplates.app_view,\n  model: new AppModel({my_component: {name: 'world'}}),\n  dynamicInitialize: true \n});"
    },
    {
      name: 'Collections of Components',
      index: 2,
      template_highlights: [{start: {line: 2, ch: 2}, end: {line: 2, ch: 55}}],
      js_highlights: [{start: {line: 14, ch: 2}, end: {line: 14, ch: 15}}],
      description_html: '<p>To render multiple instances of the same component, the component constructor can be set as the model type for  a collection of the component data.  Then the component can be rendered by looping through the collection in the template, using the <code>{{{ . }}}</code> notation to render each component.</p><p>Create a components collection named <code>my_components</code> and use the template to render each template out inside the <code>strong</code> elements.</p>',
      template: "<div>\n  <span>Components:</span><br>\n  {{#my_components}}<strong></strong>{{/my_components}}\n</div>",
      js: "var View = tungsten.View, Model = tungsten.Model, Collection = tungsten.Collection, ComponentWidget = tungsten.ComponentWidget;\n\nvar ComponentView = View.extend({});\nvar ComponentModel = Model.extend({});\nvar componentTemplate = tungsten._template.compileTemplates({template: '<div>Hello {{name}}.</div>'});\n\nvar MyComponent = function(data, options) {\n  if (data && data.constructor === ComponentWidget) {\n    return data;\n  }\n  return new ComponentWidget(ComponentView, new ComponentModel(data), componentTemplate.template, options);\n};\n\nvar AppModel = Model.extend({\n  relations: {}\n});\n\nnew View({\n  el: document.getElementById('app'),\n  template: compiledTemplates.app_view,\n  model: new AppModel({my_components: [{name: 'world'}, {name: 'Tungsten.js'}]}),\n  dynamicInitialize: true \n});"
    }
  ]

});

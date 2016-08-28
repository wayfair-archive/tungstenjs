# Components

Components allow standalone Tungsten.js "apps" to be reused and composed to build larger applications.  A component consists of a view, a model with data, and a template.  To create a component, use the Component widget on the adaptor module (currently components are only available for the Backbone adaptor).

```javascript
new ComponentWidget(View, new Model(data), template, options)
```

It's useful to export components from their own index file that handles the view/model/template imports and exports the instance of the `ComponentWidget`:

```javascript
var ComponentWidget = require('tungstenjs/adaptors/backbone').ComponentWidget;

var Model = require('./model');
var View = require('./view');
var template = require('./template.mustache');

module.exports = function(data, options) {
  if (data && data.constructor === ComponentWidget) {
    return data;
  }
  return new ComponentWidget(View, new Model(data), template, options);
};
```

Once the component is created, add the component to the model.  One way to do this is via the `relations` hash:

```javascript
relations: {
  my_component: require('path/to/my_component')
}
```

This can then be rendered in the template by referencing the property name of the component and printing it with a triple mustache tag, e.g. `{{{ my_component }}}`.  If a collection of components are rendered, a section tag and `{{{ . }}}` can be used:

```html
{{#my_components}}
  {{{ . }}}
{{/my_components}}
```

## Component API

The APIs of components are important because they are the means by which applications will interact with them.

### Events

Events from a component's model must be explicitly declared in an array on the model's `exposedEvents` hash:

```javascript
Model.extend({
  exposedEvents: ['change:completed']
});
```

Setting `exposedEvents` to `true` rather than an array will expose all events.

Additional events can also be exposed by passing in an array of event names to `exposedEvents` on the component options object.

### Methods

Custom methods from a component's model must be explicitly declared in an array on the model's `exposedFunctions` hash:

```javascript
Model.extend({
  exposedFunctions: ['myMethod']
});
```

Additional functions can also be exposed by passing in an array of function names to `exposedFunctions` on the component options object.

The `trigger`, `get`, `set`, and `has` methods are available by default on each component, and point to their corresponding model functions.

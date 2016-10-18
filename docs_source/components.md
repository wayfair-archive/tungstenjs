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

Events on components are namespaced when exposed and they are also encapsulated by the component by default.

To respond to events on a component's model, a parent or ancestor application/component can listen to the event on the model but will have to scope the listening action to the component. Events on the component's model must be exposed to its ancestor via the `exposedEvents` key.

```javascript
var ClockModel = BaseModel.extend({
  postInitialize: function() {
    this.listenTo(this, 'change:time_component:est_time', this.updateTime);
    this.listenTo(this, 'tick:time_component', this.updateTime);
  },

  updateTime: function() {
    // update the time
  }
});
```

Shown below is how the `change` event for `est_time` and a custom `tick` event on the `time_component` is exposed.

```javascript
var TimeModel = BaseModel.extend({
  exposedEvents: ['change', 'change:est_time', 'tick'],
  ...
});
```

In the above snippet,`time_component` is a child component of the `ClockModel`. We listen for a `change` on the model but scope the listening to `time_component`'s `est_time` property and call `this.updateTime` as our callback method.

The table below shows the various ways the above example could have been achieved.

| Component exposed event| Parent listeners |
| ------------- |:-------------:|
| `exposedEvents: ['change']`| `this.listenTo(this, 'change:my_component', _.noop)`
| `exposedEvents: ['change']`      | `this.listenTo(this, 'change', _.noop)`
| `exposedEvents: ['change:selected']` | `this.listenTo(this, 'change:my_component:selected', _.noop)`
| `exposedEvents: ['custom_event']` | `this.listenTo(this, 'custom_event:my_component', _.noop)`
| `exposedEvents: ['custom_event']` | `this.listenTo(this, 'custom', _.noop)`
| `exposedEvents: ['custom_event']` | `this.listenTo(this, 'custom:my_component', _.noop)`

The preferred way to deal with events on components is to have them bubble as described. You can also listen directly on the component but that poses problems in some situations. Consider a scenario where we listen on the component, we would typically listen for a change on the application model like below

```javascript
this.listenTo(this.get('time_component'), 'change:est_time', this.updateTime);
```

This code works fine until we change `time_component`. For instance, if it gets destroyed and a new one is created then the property `est_time` on which we are listening for a change event becomes no longer valid. This effectively means our callback will never get called.

### Methods

Custom methods from a component's model must be explicitly declared in an array on the model's `exposedFunctions` hash:

```javascript
Model.extend({
  exposedFunctions: ['myMethod']
});
```

Additional functions can also be exposed by passing in an array of function names to `exposedFunctions` on the component options object.

The `trigger`, `get`, `set`, and `has` methods are available by default on each component, and point to their corresponding model functions.

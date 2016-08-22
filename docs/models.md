# Models

Models in Tungsten.js use the standard Backbone model API, along with support for related (nested) models and collections.


##  App Data

Each Tungsten.js app expects a single data store where the current state of the application is kept.  This data store takes the form of an app model instance.

The root app model, like a standard Backbone model, contains the model's state in a hash of attributes.  This is usually passed from the server, via either a [boostrapped data object](http://backbonejs.org/#FAQ-bootstrap) or an [XHR request](http://backbonejs.org/#Model-fetch).  In addition to standard Backbone behavior, we also provide a nested model functionality based on Bret Little's [backbone-nested-models](https://github.com/blittle/backbone-nested-models).  To define a particular attribute as a reference to a model or collection, set `relations` hash on the model constructor with the key being the attribute name and the value being the nested model/collection constructor:

```javascript
BaseModel.extend({
  // [...]
  relations: {
    items: BaseCollection,
    foo: BaseModel
  }
});
```

## Events

Events triggered in Tungsten (non-DOM events) "bubble up" through models and collections. Unless stopped, the event will proceed from whatever given nested model triggered it, all the way up to the base model. (This does not include when the event is from a component- there is a specific process for listening to events on a child component. See '[Components](http://wayfair.github.io/tungstenjs/components.html)' for more information.) When an event has finished bubbling, a re-render is triggered.

This bubbling allows for an "events up, methods down" pattern of design. Events can bubble up from child models (containing bespoke data as necessary), and parents can listen for those events and, in response, call the appropriate methods on their children. This is how communication between parents and children in Tungsten should occur. Remember: Events Up, Methods Down!

To prevent an event from bubbling up any further, call `event.stopPropogation`. To prevent an event from bubbling up any further, and to prevent it from triggering any additional listeners on the current element, call `event.stopImmediatePropogation`. (Proper use cases for stopImmediatePropogation are rare- always prefer stopPropogation.)

(Behind the scenes, what actually happens is that Tungsten events traverse upwards through the DOM from the element on which they are triggered. Each event keeps a record of the elements it has touched, along with the js- classes on each element. When the event finds a matching event listener on an element, it will iterate through its stored path and check for instances of the js- class(es) targeted by the listener. It will then execute the event listener's method on all of these delegates. Since the structure of a Tungsten application always mirrors the structure of the DOM, events seamlessly "bubble up" through the Tungsten hierarchy of models and collections.)

## Special Properties

Included with the Backbone adaptor are special model property types which were inspired by [ampersand-state](http://ampersandjs.com/docs#ampersand-state).

**Derived Properties**: Derived properties are properties which are computed based on the value of another property.  They can be added with the `derived` hash in Backbone models, with the key being the property name and the value being an options object.  The object should include an array at key `deps` of properties that the derived property relies on, as well as a function at key `fn` which should return the derived value.  Derived properties will not be serialized with `toJSON`.

```javascript
BaseModel.extend({
  // [...]
  derived: {
      incompletedItems: {
        deps: ['todoItems'],
        fn: function() {
          return this.get('todoItems').filter(function(item) {
            return !item.get('completed');
          });
        }
      }
  }
});
```

**Computed Properties**: Properties which are computed, but not reliant on any other properties, can be added simply by adding a method with the desired property name on the model.  These will be read by templates during rendering, though they will not be accessible via `model.get()` or serialized with `toJSON`.  _Computed properties are now deprecated and will be removed in a future version of Tungsten.js.  Use derived properties instead._

**Session Properties**: Transient properties that shouldn't be serialized when saving the model can be excluded from `toJSON` by adding a `session` property to the model:

```javascript
BaseModel.extend({
  // [...]
  session: ['user', 'is_logged_in']
});
```

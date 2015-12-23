# Models

Models in Tungsten.js use the standard Backbone (or Ampersand) model API, along with support for related (nested) models and collections.


##  App Data

Each Tungsten.js app expects a single data store where the current state of the application is kept.  This data store takes the form of an app model instance.

The root app model, like a standard Backbone or Ampersand model, contains the model's state in a hash of attributes.  This is usually passed from the server, via either a [boostrapped data object](http://backbonejs.org/#FAQ-bootstrap) or an [XHR request](http://backbonejs.org/#Model-fetch).  In addition to standard Backbone and Ampersand behavior, we also provide a nested model functionality based on Bret Little's [backbone-nested-models](https://github.com/blittle/backbone-nested-models).  To define a particular attribute as a reference to a model or collection, set `relations` hash on the model constructor with the key being the attribute name and the value being the nested model/collection constructor:

```javascript
BaseModel.extend({
  // [...]
  relations: {
    items: BaseCollection,
    foo: BaseModel
  }
});
```

## Special Properties

Included with the Backbone adaptor are several special model property types which were inspired by [ampersand-state](http://ampersandjs.com/docs#ampersand-state).

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
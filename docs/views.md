# Views

Views in Tungsten.js use the standard Backbone (or Ampersand) view API, along with a few added features such as child views and extended event handling.  Each view's model is inferred from the template.

## Child Views

Child views of the app view are defined via a `childViews` hash on the view constructor, with the key being the class name of the child view and the value being the constructor for the child view.  Note: these class names must be prefixed with `js-`.

```javascript
BaseView.extend({
  // [...]
  childViews: {
    'js-child-view': ChildView,
  }
}
```

The `js-` class name for the child view must be a descendant element of the current view.  If the element doesn't exist, the view won't be rendered (until the element does exist, so mustache conditionals can be used to hide and show views).  If there are multiple descendant elements for the child view then Tungsten.js will render the view for each element.  If this is because mustache is iterating through a collection, then each of these views will have the model of the collection as its scope (see next section).

Unlike the app view, child views should not set their own template.

## Scope (`this.model`)

Tungsten.js will automatically infer the scope of the model for this child view as it traverses the template to build out the initial state.  If the child view element is wrapped in `{{#myModel}}{{/myModel}}` where `myModel` refers to a property on the current view's `this.model` that references another model (see `relations` hash), then that child view's `this.model` will be `myModel`.   If the child view element is wrapped in `{{#myCollection}}{{/myCollection}}` where `myCollection` refers to a property on the current view's `this.model` that references another collection (see `relations` hash), then Tungsten.js will create a child view for each rendered element, and each of those child views' `this.model` will be the relevant model from `myCollection`.

Usually this inferred scope is the expected behavior for the application.  However, it can be overridden by replacing the child view constructor with an object which has two properties: a key `scope` with the value being the string referencing the property name for the scope, and a key `view` with the value being the child view constructor.

```javascript
BaseView.extend({
  // [...]
  childViews: {
    // for each 'item' model in the 'items' collection
    // render a new 'js-child-view' using the ChildView
    // this.model in the each view will be the corresponding item model
    'js-child-view': ChildView,
    // render the data in the property 'meta' using
    // MetaView with 'js-meta' as the views element
    'js-meta': {
      scope: 'meta',
      view: MetaView
    }
}
```

## Event Handling

Events are defined with the standard [`events` hash](http://backbonejs.org/#View-events) API when using the Backbone or Ampersand adaptor.  If a selector is passed in the event key, however, it can only use a `js-` prefixed class selector.  This optimizes performance when delegating events because under the hood, unlike Backbone or Ampersand, Tungsten.js provides its own event delegation system.  By default, all events are delegated from the document.  Special events can also be handled by an [event handler plugin](https://github.com/wayfair/tungstenjs/tree/master/src/event/handlers).  The included event handlers are:

* Directional swipe events - exactly what it sounds like
    * `swipeup`, `swipedown`, `swipeleft`, `swiperight`
* Intent Events - limited to a subset of events that can be "cancelled". The handler will be called n milliseconds (default 200ms) after the initial event if it is not "cancelled"
    * Bindable by appending `-intent` to one of the following events and configurable using the eventOptions hash
    * `mouseenter`, `mouseleave`, `mousedown`, `mouseup`, `keydown`, `keyup`, `touchstart`, `touchend`
* Document bindings - Adds an event binding to the document with delegation still working as expected
    * Bindable by prepending `doc-` to any event type
* Window bindings - Adds an event binding to the window
    * Bindable by prepending `win-` to any event that the window fires (primarily scroll or resize, and height/width/scroll values are cached to prevent repeated reads)
* Outside Events - Adds an event binding to events firing outside of the element
    * Bindable by appending `-outside` to any event type
* Submit Data - Adds an event binding to form submit events with the form's serialized data passed as the second parameter of the callback (uses [form-serialize](https://github.com/defunctzombie/form-serialize))
    * Bindable by using the `submit-data` event type

They can be used directly in Tungsten.js views by using the events hash as usual.  For example:

```javascript
View.extend({
  // [...]
  events: {
    // standard click event
    'click .js-bar' : 'doSomethingOnClick',
    // mouseenter-intent event (see corresponding eventOptions object)
    'mouseenter-intent .js-foo' : 'doSomethingOnHoverIntent',
    // window scroll event
    'win-scroll' : 'doSomethingOnScroll',
    // outside event
    'click-outside .js-foo' :'doSomethingOnOutsideClick',
    // submit data event
    'submit-data .js-form' : 'setData'
  },
  // eventOptions hash to override default custom event options
  eventOptions: {
    'mouseenter-intent .js-foo': {
      // intentDelay defaults to 200ms; override to 100ms
      intentDelay: 100
    }
  }
});
```

## Lifecycle Methods

### `postInitialize`

Any logic that should happen in the view's initialization should be done in a `postInitialize` method on the view.  Never override `initialize`.  If extending a view that already implements `postInitialize`, consider adding `MyView.prototype.postInitialize.apply(this);` in the extended view's `postInitialize` method.

### `postRender`

In Tungsten.js, `render` is an implementation detail, and generally logic shouldn't rely on whether or when a view is being rendered.  From the view perspective, it's hard to rely on or predict when `render` will actually be called.

That being said, there are times when it's necessary to know when a view has rendered.  For example, a view might need to access its height and width after it's rendered in order to apply some customized styling.  For these edge cases, the `postRender` function is made available, and this is called synchronously after the DOM is updated (nb: but not necessarily before a browser reflow is completed).  Alternatively, the view will fire a `rendered` event immediately before `postRender` is called.
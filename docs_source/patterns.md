# Patterns in Tungsten.js Applications

The following are some general patterns and principles for building Tungsten.js applications.  As with all patterns, there are exceptions and they are likely to change over time.  But these are generally good starting points when building an application.

## Events up, methods down

The most important principle for dealing with communciation between models in Tungsten.js is this: communication up the model tree should be done via events, communication down the model tree should be done by calling methods on the models.  Events up, methods down.

What does this mean?  Suppose there are two models in a collection that need to communicate with one another.  Instead of the communication occuring directly between these two sibling models, the communication is going to go through their nearest ancestor, which in this case would be the parent model of the collection.  To do this, one model will trigger an event, e.g., `this.trigger('someEvent', data);` and the parent model will listen to that event and call a method on the second model to communicate the necessary information.  It will find which model in the collection to call the method on likely via a `collection.findWhere(attrs)` call.  Ideally the event and method should pass through only the information necessary for the communication and no more.  This is a simple case of events up, methods down for communicating between models, but it scales to more complex cases as well.

In the view's `postInitialize`, call `this.model.fetch()` (or another method that will make the ajax request and set the remaining part of the model).  This needs to be called from the _view_ `postInitialize`, not the model since the model is likely being instantiated before its attached to the view.  Once the data is set (in the callback from the ajax and set call), toggle the `loading` boolean on the model, switching to the standard template.

## DOM event handlers

The primary purpose of a view is responding to DOM events and calling methods on its model.  DOM events are all set in the `events` hash using either built in DOM events or one of the special events packaged with Tungsten.js.  A useful practice is to name all of the event handlers with the pattern "handleEventSelector".  So a plain `click` event would call the handler function `handleClick`, and a `change .js-foo` event would call the handler function `handleChangeFoo`.

The event handlers should never be called or referenced outside of the `events` hash.  Instead, if multiple event handlers need to call the same set of code, that code should be extracted out of the event handlers into its own function which can be called by both, with the minimal amount of data passed in.

For example, in this case the keyup handler is also calling handleChange and passing through the event object:

```javascript
BaseView.extend({
  events: {
    'keyup': 'handleKeyup',
    'change': 'handleChange'
  },
  handleKeyup: function(e) {
    doSomething();
    handleChange(e);
  },
  handleChange: function(e) {
    doSomethingElse(e.value);
  }
});
```

Instead, it could be refactored so that the common functionality is extracted into its own function, and the event handler is never called directly.  Additonally, this prevents the entire event object from being passed around.

```javascript
BaseView.extend({
  events: {
    'keyup': 'handleKeyup',
    'change': 'handleChange'
  },
  handleKeyup: function(e) {
    doSomething();
    commonFunctionality(e.value);
  },
  handleChange: function(e) {
    commonFunctionality(e.value);
  },
  commonFunctionality: function(data) {
    doSomethingElse(data);
  }
});
```

## No direct DOM manipulation

There is never a reason in Tungsten to do direct DOM manipulation.  This includes toggling class names on DOM nodes, changing value properties of DOM nodes, and or changing attributes on DOM nodes.  Doing so will cause a dom/vdom mismatch, and could result in broken functionality in the application (and even if the application works in some cases, it may break in others).

Instead of changing the DOM node directly, use the template to set a conditional or pass in a value for the part of the DOM that needs to change.  Then, control that by changing the same attribute in the model.

## Avoid non-input DOM selection

Selection of values in the DOM, except for inputs from the user and (in some low-level, edge cases) for height/width, is never necessary.  Instead, access the data from the model, either by bootstrapping it in the initial data or requesting the data from the server.

The only exceptions to DOM selection are for user input values, and for occasionaly selecting height/width.

User inputs need to be accessed via DOM selection.  This can be done one of three ways.  First, user input can be set to the model as the result of a DOM event such as change or input.  In this case, access the value via `event.value` (or equivilant, depending on the input type) in the event handler.  Second, user input can be set to the model in the special `submit-data` event type, which passes a form's serialized data in the second parameter of the submit event handler.  The third (and least ideal) approach to accessing user input is by selecting the DOM node in the view at any point and setting the value to the model.

The second exception to DOM selection is for selecting height/width, but this should only be done for very particular edge cases where information about the height or width is necessary for changing some dynamic height/width value that can't be handled via CSS.  Be very careful in these cases, as there may be performance implications for accessing these values.

## Avoid accessing child views

Views shouldn't be aware of their child views once they're defined.  A parent view should never try to access one or more of its child views.  Instead, if such communication is necessary, it can happen by calling a method on the parent view's model and letting the model then call a method on a child model related to that child view.

## Trigger and listen to model, not view, events

All custom events should be triggered from, and listened to, from models, not views.  Views are generally only responsible for responding to DOM events and calling methods on the model.  If views need to communicate upwards, that communication should be done through the model instead.  A method can be called on the view's model to trigger an event that bubbles up from the model.

## Avoid accessing parents

Parent views and parent models should never be directly accessed.  In both cases, communication should go through events bubbled from the child models.

## Let events bubble

Events on child models or collections can be heard by selecting the child model/collection and listening directly on that, e.g. `this.listenTo(this.get('foo'), 'bar', doSomething);`.  This will work, but can be problematic if the child model/collection is removed at some point.  This becomes even more challenging if the child model/collection is nested multiple layers deep.  For these reasons, it's preferable to listen on one's self, and trust that events will bubble up.  So the above example would instead be `this.listenTo(this, 'bar', doSomething);`, or if the event should be namespaced to its property, `this.listenTo(this, 'foo:bar', doSomething);`.

## Treat render as an implementation detail

Tungsten.js abstracts DOM rendering by utilizing the virtual-dom engine which decides whether and how to update the DOM when a change to the model occurs.  For this reason, listening to a view's `rendered` event (or using `postRender`) is often unnecessary and can be misleading.  When a render happens can be hard to predict from an application standpoint: often times they can be called more or less than expected.  Instead of listening to render to do something, find the appropriate model event to listen to and respond to that.  The only exception is for edge-cases which need to rely a render occurred to update the DOM, for example, doing something only after an animation has finished.

## Deferred fetch

A popular UX pattern is showing a light-weight placeholder template before loading in the actual content.  These are sometimes called loading, skeleton, or in-flight templates.  They can be great for providing a boost in perceived performance while the actual content is downloading.

To do this in Tungsten.js, set a condition in the template for the in-flight template:

```html
{{#loading}}
  {{ > loading_view }}
{{/loading}}
{{^loading}}
  {{ > standard_view }}
{{/loading}}
```

## The input value problem

A challenging case can occur when a text input should update a model attribute on `keyup` or `input`, and also be able to be updated via setting that same property in the model.  The code ends up something like this:

```html
<input value="{{val}}" type="text">
```

```javascript
BaseView.extend({
  events: {
    'input .js-input': function(e) {
      this.model.set({val: e.currentTarget.value});
    }
  }
});
```

However this can result in a focus issue when modifying an existing value in a text input, and potentially a race condition between the JS update and the user input.  To solve this, a silent update may be used in the event handler so that the field does not re-render on user input.  However, on its own this is insufficient, since it would mean an inability to to change the field's value via the model if it didn't differ from the initial value (e.g., when re-emptying a field via `this.model.set('val', '');`).  To get around this, the function `view.updateVtree` is available to update the view's vtree in cases where the model was updated without an event.

```javascript
BaseView.extend({
  events: {
    'input .js-input': function(e) {
      this.model.set({name: e.currentTarget.value}, {silent: true});
      this.updateVtree();
    }
  }
});
```
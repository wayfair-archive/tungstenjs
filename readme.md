# ![Tungsten.js](https://cdn.rawgit.com/wayfair/tungstenjs/master/extra/tungstenjs_logo.svg)
[![Build Status](https://travis-ci.org/wayfair/tungstenjs.svg?branch=master)](https://travis-ci.org/wayfair/tungstenjs)
[![npm version](https://badge.fury.io/js/tungstenjs.svg)](https://www.npmjs.com/package/tungstenjs)
[![code coverage](https://codecov.io/github/wayfair/tungstenjs/coverage.svg?branch=master)](https://codecov.io/github/wayfair/tungstenjs?branch=master)

Tungsten.js is a modular framework for creating web UIs with high-performance rendering on both server and client.

## What Tungsten.js Provides

* High-performance virtual DOM updates powered by [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
* Use of mustache templates, parsed with [Ractive.js](https://github.com/ractivejs/ractive), which render to virtual DOM objects
* Event system which binds and delegates each event type to the document root
* Adaptor for [Backbone.js](https://github.com/jashkenas/backbone) or [Ampersand.js](https://github.com/ampersandjs) views

## Motivation

Tungsten.js was built as an alternative to existing front-end JavaScript libraries because we needed a library with:

* Fast, first-class server-side rendering across multiple platforms
* Fast client-side DOM updates with support back to IE8
* Modular interfaces to swap out library components as necessary

## How Tungsten.js Works

In Tungsten.js, the initial page loaded is rendered with [Mustache](http://mustache.github.io/) templates on the server (in, say, [C++](https://github.com/mrtazz/plustache), [PHP](https://github.com/bobthecow/mustache.php), or [Go](https://github.com/hoisie/mustache)) then rehydrated by Tungsten.js on the client.  Subsequent DOM updates are made with those same mustache templates which have been [pre-compiled](precompile/tungsten_template/index.js) to functions which return virtual DOM objects used by [virtual-dom](https://github.com/Matt-Esch/virtual-dom) to diff and patch the existing DOM.

An adaptor layer is used to connect with Tungsten.js with a preferred modular client-side framework to handle data and view management.  The default adaptor is a thin layer on top of [Backbone.js](https://github.com/jashkenas/backbone) with a `childViews` hash to define relationships between views and a `compiledTemplate` property to define the root pre-compiled template function.  There is also a similar Ampersand.js adaptor available.

Tungsten.js has no hard dependency on [jQuery](https://github.com/jquery/jquery), and uses the jQuery-less [backbone.native](https://github.com/inkling/backbone.native) in its Backbone adaptor.

## Backbone.js Adaptor

Tungsten.js is pre-packaged with an adaptor for using Backbone.js.  This adaptor is can be included via CommonJS or ES6 Modules at `tungstenjs/adaptors/backbone/index.js` and exposes base modules for Backbone (as well as a direct reference to Backbone itself).

`View`, `Model`, and `Collection` are drop-in replacements for `Backbone.View`, `Backbone.Model`, and `Backbone.Collection` constructor functions.  They can be extended as usual to create custom constructors.  Any initialization logic in views, models, or collections should be put in a `postInitialize` method on the constructor (which automatically gets called after `initialize()`), rather than in `initialize`.

The Backbone.js adaptor includes a forked version of [backbone-nested-models](https://github.com/blittle/backbone-nested-models).

## Usage

### Install

``` npm install tungstenjs --save```

For the latest, but unstable, version:

``` npm install git+http://github.com:wayfair/tungstenjs.git#master --save```

### Bundler

Using a module bundler such as [webpack](http://webpack.github.io/) is recommend.  Tungsten.js with the Backbone or Ampersand adaptor expects `jquery` to be shimmed, either with jQuery itself or with the jQuery-less shim [backbone.native](https://github.com/inkling/backbone.native).  With webpack, this looks like:

```javascript
module.exports = {
  // [...]
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  }
};
```

See [examples](https://github.com/wayfair/tungstenjs/tree/master/examples) for more details.

### Requirements

* `Node.js` (for builds; not necessary for production runtime)
* `webpack` or other CommonJS compatible client-side module loader
* [{{ mustache }}](http://mustache.github.io/) renderer on server (for server-side rendering)

### Including an Adaptor

The Backbone.js adaptor can be included by requiring `tungstenjs/adaptors/backbone` after installing the `tungstenjs` Node module.  Similarly, the Ampersand.js adaptor can be included by requiring `tungstenjs/adaptors/ampersand`.  Each of these adaptors provide a `view`, `model`, and `collection` property which should be used as the base view, model, and collection constructors in the application.  As usual with Backbone and Ampersand, custom constructors can extend from each of these.

###  Getting Started

When using the Backbone or Ampersand adaptor, we recommend starting with an app model, app view, and app ([mustache](https://mustache.github.io/)) template.  These are the entry points for a Tungsten.js applications.  A place to bootstrap the app and get everything started is also needed: often this is in the form of an init file:

```javascript
var AppView = require('./views/app_view');
var AppModel = require('./models/app_model');
var template = require('../templates/app_view.mustache');

module.exports = new AppView({
  el: '#app',
  template: template,
  model: new AppModel(window.data)
});
```

A [webpack](http://webpack.github.io/) loader, `tungsten_template`, is provided to pre-compile JS template functions, and can be included like so in the `webpack.config.js`  (currently a json-loader for the HTML tokenizer is also included)::

```javascript
module.exports = {
  // [...]
  resolveLoader: {
    modulesDirectories: ['node_modules', 'node_modules/tungstenjs/precompile']
  },
  module: {
    loaders: [
      { test: /\.mustache$/, loader: 'tungsten_template' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
}
```

### Templates

The markup for Tungsten.js views are described by mustache templates which are shared for both server-side and client-side rendering.

#### Server Side Rendering

By default, Tungsten.js expects that on page load the HTML for the initial state will be rendered from the server using the same data and template that was used to bootstrap the application.  This means that Tungsten.js will not re-render on the application on page load.  This default behavior, however, can be overridden by setting the `dynamicInitialize` property when initializing the app view:

```javascript
module.exports = new AppView({
  el: '#app',
  template: template,
  model: new AppModel(window.data),
  // Set the following line for client-side only rendering
  dynamicInitialize: true
});
```

`dynamicInitialize` should only be set when the application won't be rendered from the server and will instead be client-side rendered only.

Tungsten.js is agnostic to the server technology used to render the template.  The only restriction is that the output of the server-side rendered template mustache match the output of the bootstrapped data and client-side template.  There are implementations of mustache rendering engines available in a variety of server-side technologies, including [Node.js](https://github.com/raycmorgan/Mu), [Java](https://github.com/spullara/mustache.java), [C++](https://github.com/mrtazz/plustache), [PHP](https://github.com/bobthecow/mustache.php), and [Go](https://github.com/hoisie/mustache).

### Pre-compiled Templates

Each template and partial should be pre-compiled with the provided wrapper for the Ractive-based pre-compiler. A webpack loader, `tungsten_template`, is provided for this purpose.  With this template pre-compiling, there are a few edge cases which depart from standard mustache rules:

* All HTML attributes must have a value, including `disabled`, `selected`, `novalidate`, etc.
    * Breaks: `<select {{#some_bool}}disabled{{/some_bool}} ...`
    * Works: `<select class="foo" {{#some_bool}}disabled="disabled"{{/some_bool}} ...`
* Opening and closing HTML tags must be within the same conditional block.
* `<a>` elements cannot be nested.


###  App Data

Each Tungsten.js app expects a single data store where the current state of the application is kept.

With the Backbone and Ampersand adaptors, this data store takes the form of an app model instance.  This root app model, like a standard Backbone or Ampersand model, contains the model's state in a hash of attributes.  This is usually passed from the server, via either a [boostrapped data object](http://backbonejs.org/#FAQ-bootstrap) or an [XHR request](http://backbonejs.org/#Model-fetch).  In addition to standard Backbone and Ampersand behavior, we also provide a nested model functionality based on Bret Little's [backbone-nested-models](https://github.com/blittle/backbone-nested-models).  To define a particular attribute as a reference to a model or collection, set `relations` hash on the model constructor with the key being the attribute name and the value being the nested model/collection constructor:

```javascript
BaseModel.extend({
  // [...]
  relations: {
    items: BaseCollection,
    foo: BaseModel
  }
});
```

#### Special Properties

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

**Computed Properties**: Properties which are computed, but not reliant on any other properties, can be added simply by adding a method with the desired property name on the model.  These will be read by templates during rendering, though they will not be accessible via `model.get()` or serialized with `toJSON`.

**Session Properties**: Transient properties that shouldn't be serialized when saving the model can be excluded from `toJSON` by adding a `session` property to the model:

```javascript
BaseModel.extend({
  // [...]
  session: ['user', 'is_logged_in']
});
```


### Child Views

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

#### Scope (`this.model`)

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

### Event Handling

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

### Example with Backbone

This is a simple view using the included Backbone.js adaptor.  See the Tungsten.js [TodoMVC](examples/todomvc) app for a more complete example.

```javascript

var BackboneAdaptor = require('tungstenjs/adaptors/backbone');
var NewItemView = require('path/to/newItemView.js');
var TodoItemView = require('path/to/todoItemView.js');

var View = BackboneAdaptor.View;

var TodoAppView = View.extend({

  // Pre-compiled template
  compiledTemplate: appViewTemplate,

  // Child views hash.  Key is the class name for the view,
  // value is the Backbone view constructor.
  childViews: {
    'js-new-todo': NewItemView,
    'js-todo-item': TodoItemView
  },

  // Standard Backbone events hash.
  events: {
    'click .js-toggle-all': 'handleClickToggleAll',
    'click .js-clear-completed': 'handleClickClearCompleted'
  },

  // Standard event handler functions
  handleClickClearCompleted: function() {
    var items = this.model.get('todoItems');
    items.remove(items.where({completed: true}));
  },
  handleClickToggleAll: function(e) {
    var completed = e.currentTarget.checked;
    this.model.get('todoItems').map(function(item) {
      item.set('completed', completed);
    });
  }
});
```

## Components

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

### Component API

The APIs of components are important because they are the means by which applications will interact with them.

#### Events

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


## Implementing a custom adaptor

*Coming Soon*

## Debugger

Tungsten.js can be optionally packaged, via webpack, with the Tungsten.js Debugger.  To build with the debugger, run the webpack build with `--dev`.  Once included in the build, the debugger can be activated by running `window.launchDebugger()` in the console and clicking on the "Open Tungsten.js Debugger" button that appears in the document.  Currently the debugger only works with the Backbone adaptor for Tungsten.js.

The debugger was inspired by (and uses styles from) Jason Laster's [marionette.inspector](https://github.com/marionettejs/marionette.inspector).

The debugger is composed of two main panels: view and data.

### View Debugger Panel

**View**: This section lists the `cid`, `debugName`, `tagName`, `className`, and the element of the selected view.

**Methods**: All methods on the selected view are listed here (inherited methods can be shown by clicking the checkbox).  Clicking "untracked" next to a method name will toggle tracking: when tracking is on, a stack trace will be printed to the main console when the method is called.

**Events**: Inputting an event name in the text field in this section will add an ad hoc event listener for that event on the selected view which, when triggered, will print a stack trace of the event in the main console.

**View Events**: Inputting an event name in the text field in this section will add an ad hoc event listener for that event on the selected view which, when triggered, will print a stack trace of the event in the main console.

**Time Travel**: This section has controls for rewinding and replaying the state of the selected view's model over time.

**Model**: This section lists the `debugName` of the selected view's model which links to the model in the data panel.  If present, it will also list the `collectionCid` and `parentProp` of the view's model.

**VDOM Template, and Difference from Current DOM**: These sections will show the selected view's VDOM in memory and how, if at all, it differs from the actual DOM.  This is helpful for debugging differences between the rendered DOM and the virtual DOM in memory.

### Data Debugger Panel

The data debugger panel displays information about all models and collections in your Tungsten.js applications.  Most sections apply for each individual model or collection, except for attributes and initial attributes which apply only to models.

**Model**: This section lists the `debugName` and `parentProp` of the selected model or collection.

**Model Events**: Inputting an event name in the text field in this section will add an ad hoc event listener for that event on the selected model or collection which, when triggered, will print a stack trace of the event in the main console.

**Attributes**: This section lists the current attributes on the model, which can be live updated by clicking on the attribute value and updating the input field.

**Initial Attributes**: This section lists the attributes present on the model when it was initialized.  The "Reset Data" button resets the current attributes to the initial state of the model.

**Methods**: All methods on the selected model or collection are listed here (inherited methods can be shown by clicking the checkbox).  Clicking "untracked" next to a method name will toggle tracking: when tracking is on, a stack trace will be printed to the main console when the method is called.

**Import/Export Snapshots**: Clicking "Get Current Snapshot" will output a JSON string of the selected model or collection state in the input field in this section.  Conversely, the selected model or collection state in the input field can be updated by inputting a JSON string and clicking "Set App to Snapshot".

## Versioning

`master`  changes regularly and so is unsafe and may break existing APIs.  Published releases, however, attempt to follow [semver](http://semver.org/).

## Changelog

* 0.5.0 Add debugger
* 0.4.0 Add derived properties support for Backbone adaptor
* 0.3.0 Performance updates, especially when using `{{{ }}}` in templates
* 0.2.0 Add event plugin system and Ampersand.js adaptor
* 0.1.0 Open source initial code at [tungstenjs](https://github.com/wayfair/tungstenjs)

## Credits

Tungsten.js was created by [Matt DeGennaro](http://twitter.com/thedeeg) and is maintained by the JavaScript team at [Wayfair](http://engineering.wayfair.com/).  Contributions are welcome.

Tungsten.js uses portions of these and other open source libraries:

* [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
* [vdom-virtualize](https://github.com/marcelklehr/vdom-virtualize)
* [Ractive.js](https://github.com/ractivejs/ractive)
* [mustache.js](https://github.com/janl/mustache.js)
* [backbone](https://github.com/jashkenas/backbone)
* [backbone-nested-models](https://github.com/blittle/backbone-nested-models)
* [Tocca.js](https://github.com/GianlucaGuarini/Tocca.js)


## License

Tungsten.js is distributed with an Apache Version 2.0 license.  See [LICENSE](LICENSE) for details.  By contributing to Tungsten.js, you agree that your contributions will be licensed under its Apache Version 2.0 license.

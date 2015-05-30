# Tungsten.js

Tungsten.js is a modular framework for creating web UIs with high-performance rendering on both server and client.

## What Tungsten.js Provides

* High-performance virtual DOM updates powered by [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
* Mustache templates, parsed with [Ractive.js](https://github.com/ractivejs/ractive), which render to virtual DOM objects
* Event system which binds and delegates each event type to the document root
* Adaptor for [Backbone.js](https://github.com/jashkenas/backbone) or [Ampersand.js](https://github.com/ampersandjs) views

## Motivation

Tungsten.js was built as an alternative to existing front-end JavaScript libraries because we needed a library with:

* Fast, first-class server-side rendering across multiple platforms
* Fast client-side DOM updates with support back to IE8
* Modular interfaces to swap out library components as necessary

## How Tungsten.js Works

In Tungsten.js, the initial page loaded is rendered with [Mustache](http://mustache.github.io/) templates on the server (in, say, [C++](https://github.com/mrtazz/plustache), [PHP](https://github.com/bobthecow/mustache.php), or [Go](https://github.com/hoisie/mustache)) then rehydrated by Tungsten.js on the client.  Subsequent DOM updates are made with those same mustache templates which have been [pre-compiled](precompile/tungsten_template/index.js) to functions which return virtual DOM objects used by [virtual-dom](https://github.com/Matt-Esch/virtual-dom) to diff and patch the existing DOM.

An adaptor layer is used to connect with Tungsten.js with your favorite modular client-side framework to handle data and view management.  The default adaptor is a thin layer on top of [Backbone.js](https://github.com/jashkenas/backbone) with a `childViews` hash to define relationships between views and a `compiledTemplate` property to define the root pre-compiled template function.  There is also a similar Ampersand.js adaptor available.

Tungsten.js has no hard dependency on [jQuery](https://github.com/jquery/jquery), and uses the jQuery-less [backbone.native](https://github.com/inkling/backbone.native) in its Backbone adaptor.

Tungsten is ~15kb packed and gzipped. Bundled with Backbone and the adaptor, it's ~25kb packed and gzipped.

## Backbone.js Adaptor

Tungsten.js is pre-packaged with an adaptor for using Backbone.js.  This adaptor is can be included via CommonJS or ES6 Modules at `tungstenjs/adaptors/backbone/index.js` and exposes base modules for Backbone (as well as a direct reference to Backbone itself).

`View`, `Model`, and `Collection` are drop-in replacements for `Backbone.View`, `Backbone.Model`, and `Backbone.Collection` constructor functions.  They can be extended as usual to create your own custom constructors.

The Backbone.js adaptor includes a forked version of [backbone-nested-models](https://github.com/blittle/backbone-nested-models).

## Usage

### Install

``` npm install tungstenjs ```

### Requirements

* `Node.js` and `npm` (for builds; not necessary for production runtime)
* `webpack` or other CommonJS compatible client-side module loader
* [Mustache](http://mustache.github.io/) renderer on server (for server-side rendering)

### Include Backbone Adaptor

The Backbone.js adaptor can be included by requiring `tungstenjs/adaptors/backbone` after installing the `tungstenjs` Node module.

### Include Ampersand Adaptor

The Ampersand.js adaptor can be included by requiring `tungstenjs/adaptors/ampersand` after installing the `tungstenjs` Node module.

### Example with Backbone

This is a simple view using the included Backbone.js adaptor.  See the Tungsten.js [TodoMVC](examples/todomvc) app for a more complete example.

```javascript

    // Import Tungsten.js Backbone Adaptor in place of Backbone.View;
    // this example uses CommonJS, but other module formats, such as ES6 modules,
    // could be used with a bundler such as webpack
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

## Implementing your own adaptor

*Coming Soon*

## Versioning

`master`  changes regularly and so is unsafe and may break existing APIs.  Published releases, however, attempt to follow [semver](http://semver.org/).

## Changelog

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
# ![Tungsten.js](https://cdn.rawgit.com/wayfair/tungstenjs/master/extra/tungstenjs_logo.svg)
[![Build Status](https://travis-ci.org/wayfair/tungstenjs.svg?branch=master)](https://travis-ci.org/wayfair/tungstenjs)
[![npm version](https://badge.fury.io/js/tungstenjs.svg)](https://www.npmjs.com/package/tungstenjs)
[![code coverage](https://codecov.io/github/wayfair/tungstenjs/coverage.svg?branch=master)](https://codecov.io/github/wayfair/tungstenjs?branch=master)

Tungsten.js is a modular framework for creating web UIs with high-performance rendering on both server and client.

[wayfair.github.io/tungstenjs/](https://wayfair.github.io/tungstenjs/)

## What Tungsten.js Provides

* High-performance virtual DOM updates powered by [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
* Use of mustache templates, with HTML parsed by [htmlparser2](https://github.com/fb55/htmlparser2), which render to virtual DOM objects
* Event system which binds and delegates each event type to the document root
* Adaptor for [Backbone.js](https://github.com/jashkenas/backbone) views and models

## Motivation

Tungsten.js was built as an alternative to existing front-end JavaScript libraries because we needed a library with:

* Fast, first-class server-side rendering across multiple platforms
* Fast client-side DOM updates with support back to IE8
* Modular interfaces to swap out library components as necessary

## How Tungsten.js Works

In Tungsten.js, the initial page loaded is rendered with [Mustache](http://mustache.github.io/) templates on the server (in, say, [C++](https://github.com/mrtazz/plustache), [PHP](https://github.com/bobthecow/mustache.php), or [Go](https://github.com/hoisie/mustache)) then rehydrated by Tungsten.js on the client.  Subsequent DOM updates are made with those same mustache templates which have been [pre-compiled](precompile/tungsten_template/index.js) to functions which return virtual DOM objects used by [virtual-dom](https://github.com/Matt-Esch/virtual-dom) to diff and patch the existing DOM.

An adaptor layer is used to connect with Tungsten.js with a preferred modular client-side framework to handle data and view management.  The default adaptor is a thin layer on top of [Backbone.js](https://github.com/jashkenas/backbone) with a `childViews` hash to define relationships between views and a `compiledTemplate` property to define the root pre-compiled template function.  Other adaptors can also be used with the core library.

Tungsten.js has no dependency on [jQuery](https://github.com/jquery/jquery).

## Setup

### Install

``` npm install tungstenjs --save```

For the latest, but unstable, version:

``` npm install git+http://github.com:wayfair/tungstenjs.git#master --save```

### UMD

The UMD build is the preferred method for including Tungsten.js in a project, and is generally included via `require('tungstenjs')`.
Dependencies are bundled in the build.  It exposes [underscore] and [backbone]
as `tungstenjs._` and `tungstenjs.Backbone` to be used globally if necessary.

To compile templates, use
`tungsten.templateHelper.compileTemplates({myTemplate: 'Hello {{name}.'})`.
Ordinarily this is done on the server at build time.

An client-side only example of a Tungsten.js app using the UMD build is
available in the [examples].

[underscore]: http://underscorejs.org/
[backbone]: http://backbonejs.org/
[examples]: https://github.com/wayfair/tungstenjs/tree/master/examples/browser-standalone

### Bundler (e.g., webpack)

Tungsten.js can be built for your application using a module bundler such as [webpack](http://webpack.github.io/).  Because Backbone expects `jQuery` to be present, Tungsten.js includes a jQuery-less shim, `src/polyfill/jquery`, which is included in the default build.

### Requirements

* `Node.js` (for builds; not necessary for production runtime)
* `webpack` or other CommonJS compatible client-side module loader
* [{{ mustache }}](http://mustache.github.io/) renderer on server (for server-side rendering)

### API

The API a developer interacts with when building an API with Tungsten.js is the API of the Backbone adaptor, which provides `View`, `Model`, and `Collection` properties.  These are available directly when importing the Tungsten.js build and are used as the base view, model, and collection constructors in the application.  As usual with Backbone, custom constructors can extend from each of these.

##  Getting Started

When building a Tungsten.js app we recommend starting with an app model, app view, and app ([mustache](https://mustache.github.io/)) template.  These are the entry points for a Tungsten.js applications.  A place to bootstrap the app and get everything started is also needed: often this is in the form of an init file:

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

See the Tungsten.js [TodoMVC](https://github.com/wayfair/tungstenjs/tree/master/examples/todomvc) app for a complete example.

## Documentation

Detailed documentation on Tungsten.js features can be found in `/docs`:

* [Templates](https://github.com/wayfair/tungstenjs/blob/master/docs/templates.md)
* [Views](https://github.com/wayfair/tungstenjs/blob/master/docs/views.md)
* [Models](https://github.com/wayfair/tungstenjs/blob/master/docs/models.md)
* [Components](https://github.com/wayfair/tungstenjs/blob/master/docs/components.md)
* [Debugger](https://github.com/wayfair/tungstenjs/blob/master/docs/debugger.md)

## Versioning

`master`  changes regularly and so is unsafe and may break existing APIs.  Published releases, however, attempt to follow [semver](http://semver.org/).  High level changelog available at [CHANGELOG.md](https://github.com/wayfair/tungstenjs/blob/master/CHANGELOG.md).

## Credits

Tungsten.js was created by [Matt DeGennaro](http://twitter.com/thedeeg) and is maintained by the JavaScript team at [Wayfair](http://engineering.wayfair.com/).  Contributions are welcome.

Tungsten.js uses portions of these and other open source libraries:

* [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
* [vdom-virtualize](https://github.com/marcelklehr/vdom-virtualize)
* [htmlparser2](https://github.com/fb55/htmlparser2)
* [backbone](https://github.com/jashkenas/backbone)
* [backbone-nested-models](https://github.com/blittle/backbone-nested-models)
* [Tocca.js](https://github.com/GianlucaGuarini/Tocca.js)


## License

Tungsten.js is distributed with an Apache Version 2.0 license.  See [LICENSE](LICENSE) for details.  By contributing to Tungsten.js, you agree that your contributions will be licensed under its Apache Version 2.0 license.

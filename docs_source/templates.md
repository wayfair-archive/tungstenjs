# Templates

The markup for Tungsten.js views are described by mustache templates which are shared for both server-side and client-side rendering.

## Server Side Rendering

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

Tungsten.js is agnostic to the server technology used to render the template.  The only restriction is that the output of the server-side rendered template mustache match the output of the bootstrapped data and client-side template.  There are implementations of mustache rendering engines available in a variety of server-side technologies, including [Node.js](https://github.com/raycmorgan/Mu), [Java](https://github.com/spullara/mustache.java), [C++](https://github.com/mrtazz/plustache), [PHP](https://github.com/bobthecow/mustache.php), and [Go](https://github.com/cbroglie/mustache).

## Pre-compiled Templates

Each template and partial should be pre-compiled with the provided wrapper for the Ractive-based pre-compiler. A webpack loader, `tungsten_template`, is provided for this purpose.  With this template pre-compiling, there are a few edge cases which depart from standard mustache rules:

* All HTML attributes must have a value, including `disabled`, `selected`, `novalidate`, etc.
    * Breaks: `<select {{#some_bool}}disabled{{/some_bool}} ...`
    * Works: `<select class="foo" {{#some_bool}}disabled="disabled"{{/some_bool}} ...`
* Opening and closing HTML tags must be within the same conditional block.
* `<a>` elements cannot be nested.

The `precompiler` API can be used to create a [webpack](http://webpack.github.io/) loader. `tungsten.precompiler` is provided to pre-compile JS template functions, and can be used in a webpack configuration like so:

**`loaders/tungsten_template.js`**
```javascript
module.exports = require('tungstenjs').precompiler;
```

**`webpack.config.js`**
```javascript
module.exports = {
  // [...]
  resolveLoader: {
    modules: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'loaders')
    ]
  },
  module: {
    loaders: [
      { test: /\.mustache$/, loader: 'tungsten_template' }
    ]
  }
}
```

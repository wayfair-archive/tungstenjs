# Tungsten.js plugins

This folder contains Tungsten.js plugins.  Currently, these are built into UMDs
and packaged with Tungsten.js.  Over-time these will be moved to separate npm
modules that are managed together in this folder.

## Building Plugins

Plugins are built with `plugins/webpack.config.js`.  This build
should be run from the npm script `build-plugins`:
```bash
npm run build-plugins
```

Built plugins can be found in `dist/`.

## Testing Plugins

Unit tests for these plugins can be found in `tests/plugins/` and run using `npm
test`.

## Adding a new plugin

In the terminal:
```bash
cd plugins
mkdir <PLUGIN_NAME>
touch <PLUGIN_NAME>/index.js
```

In `webpack.plugins.js`:
```js
var entryPoints = {
  ...
  'document': ['./plugins/tungsten-event-document'],
  'focus': ['./plugins/tungsten-event-focus'],
  '<PLUGIN_NAME>': ['./<PLUGIN_NAME>'],
  ...
}
```

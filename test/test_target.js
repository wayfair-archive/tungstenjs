'use strict';

// Loads all files in this directory ending with "_spec.js"
var ctx = require.context(__dirname, true, /base_model_spec\.js$/);
var files = ctx.keys();
for (var i = 0; i < files.length; i++) {
  ctx(files[i]);
}

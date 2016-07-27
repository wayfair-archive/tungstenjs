/* eslint-env node */
var now = function() {
  var time = process.hrtime();
  // Convert seconds and nanoseconds into high-resolution milliseconds
  return (time[0] * 1000) + (time[1] / 1e6);
};

setTimeout(function() {
  var start = now();
  require('./dist/tungsten.backbone.node.js');
  console.log('startup time:', now() - start); // eslint-disable-line no-console

  // setTimeout(function() {
  //   var start = now();
  //   require('./dist/tungsten.backbone.debug.node.js');
  //   console.log('debug startup time:', now() - start); // eslint-disable-line no-console
  // }, 1);
}, 1);


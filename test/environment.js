/*eslint-disable no-undef */
/*eslint-env node */
var jsdom = require('jsdom-nogyp');

var document = jsdom.jsdom('<html><head></head><body></body></html>');
global.document = document;
global.window = document.parentWindow;
global.navigator = window.navigator;


module.exports = window;
/*eslint-enable no-undef */
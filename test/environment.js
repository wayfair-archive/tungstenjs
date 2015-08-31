var jsdom = require('jsdom-nogyp');

var document = jsdom.jsdom('<html><head></head><body></body></html>');
global.document = document;
global.window = document.parentWindow;
global.navigator = window.navigator;
global.Element = window.Element;

// Leaving Jasmine expect available for spies
global.jasmineExpect = global.expect;
// Include Chai assertion library
global.expect = require('chai').expect;

module.exports = window;

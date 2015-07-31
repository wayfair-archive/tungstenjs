/**
 * template_spec.js
 *
 * @author    Andrew Rota <anrota@wayfair.com>
 */
/* global describe, it, expect, require */
'use strict';

// Include Chai assertion library
var expect = require('chai').expect;

// Module to test is tungsten.js
var tungsten = require('../src/tungsten.js');

// Use Backbone adaptor
var Context = require('../src/template/template_context');
var BackboneAdaptor = require('../adaptors/backbone/context_adaptor');
Context.setAdapterFunctions(BackboneAdaptor);

// Start test suite
describe('tungsten.js template compiler', function() {
  it('should replace variable in heading', function() {
    var basicTemplate = require('./templates/basic.mustache');
    expect(basicTemplate.toString({name: 'world'})).to.equal('<h1>Hello, world.</h1>');
  });
});

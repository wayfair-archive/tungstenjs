'use strict';
/* global describe, it, require, beforeEach */
var documentBind = require('../../../../src/event/handlers/document_events.js');

describe('document_events', function() {
  var elem, type, handler;
  beforeEach(function() {
    elem = document.createElement('div');
    type = 'click';
    handler = function() {};
  });
  afterEach(function() {
    elem = undefined, type = undefined, handler = undefined;
  });
  it('should call bindVirtualEvent when event is prefixed with doc-', function() {
    var spy = jasmine.createSpy('spy');
    documentBind(elem, 'doc-' + type, '', handler, {}, spy);
    jasmineExpect(spy).toHaveBeenCalledWith(document, type, '', handler, {});
  });
  it('should not call bindVirtualEvent when event is not prefixed with doc-', function() {
    var spy = jasmine.createSpy('spy');
    documentBind(elem, 'foo-' + type, '', handler, {}, spy);
    jasmineExpect(spy).not.toHaveBeenCalled();
  });

});

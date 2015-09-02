'use strict';

/* global describe, it, require */
'use strict';

var isArray = require('../../../src/utils/is_array.js');

describe('is_array.js public API', function() {
  it('should positively identify arrays', function() {
    expect(isArray([])).to.be.true;
    expect(isArray([
      []
    ])).to.be.true;
    expect(isArray([1, 2, 3])).to.be.true;
  });
  it('should negatively identify non-arrays', function() {
    expect(isArray({})).to.be.false;
    expect(isArray(true)).to.be.false;
    expect(isArray(5)).to.be.false;
  });
  it('should positively identify arrays (< ES5)', function() {
    var _isArray = Array.isArray.bind({});
    Array.isArray = undefined;
    expect(isArray([])).to.be.true;
    expect(isArray([
      []
    ])).to.be.true;
    expect(isArray([1, 2, 3])).to.be.true;
    Array.isArray = _isArray;
  });
  it('should negatively identify non-arrays (< ES5)', function() {
    var _isArray = Array.isArray.bind({});
    Array.isArray = undefined;
    expect(isArray({})).to.be.false;
    expect(isArray(true)).to.be.false;
    expect(isArray(5)).to.be.false;
    Array.isArray = _isArray;
  });
});

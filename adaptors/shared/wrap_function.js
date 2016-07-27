'use strict';

function wrapFunction(first, second) {
  return function() {
    let args = INLINE_ARGUMENTS;
    first.apply(this, args);
    second.apply(this, args);
  };
}

module.exports = wrapFunction;

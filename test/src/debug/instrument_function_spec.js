const instrumentFunction = require('../../../src/debug/instrument_function');
const Timer = require('../../../src/debug/timer');
const logger = require('../../../src/utils/logger');

describe('instrumentFunction', () => {
  beforeEach(() => {
    this.fn = (arg) => {
      return arg;
    };

    this.name = 'myFunction';
    this.arg = 'foo';
    this.time = 1.23456789;

    spyOn(this, 'fn').and.callThrough();
    spyOn(logger, 'trace');
    spyOn(Timer.prototype, 'getMeasurement').and.returnValue(this.time);

    this.instrumentedFn = instrumentFunction(this.name, this.fn);

    this.returnValue = this.instrumentedFn(this.arg);
  });

  it('calls the original function and returns its return value', () => {
    jasmineExpect(this.fn).toHaveBeenCalledWith(this.arg);
    expect(this.returnValue).to.equal(this.arg);
  });

  it('logs arguments', () => {
    jasmineExpect(logger.trace).toHaveBeenCalledWith(
          jasmine.stringMatching(/^myFunction/),
          jasmine.arrayContaining([this.arg])
    );
  });

  it('logs execution time and return value', () => {
    jasmineExpect(logger.trace).toHaveBeenCalledWith(
          jasmine.stringMatching(/^myFunction.+1.2346ms/),
          this.arg
    );
  });
});

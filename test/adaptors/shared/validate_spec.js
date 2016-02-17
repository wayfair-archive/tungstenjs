var validate = require('../../../adaptors/shared/validate');

describe('validate', function() {
  describe('childViews', function() {
    it('should be a function', function() {
      expect(validate.childViews).to.be.a('function');
      expect(validate.childViews).to.have.length(1);
    });
    it('should throw for invalid childViews', function() {
      var fn1 = function() {
        validate.childViews({'.js-child': null});
      };
      var fn2 = function() {
        validate.childViews({'child': null});
      };
      expect(fn1).to.throw();
      expect(fn2).to.throw();
    });
    it('should not throw for valid childViews', function() {
      var fn = function() {
        validate.childViews({'js-child': null});
      };
      expect(fn).not.to.throw();
    });
  });
});

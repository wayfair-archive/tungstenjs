var validate = require('../../../adaptors/shared/validate');
var View = require('../../../adaptors/backbone/base_view');

describe('validate', function() {
  describe('childViews', function() {
    it('should be a function', function() {
      expect(validate.childViews).to.be.a('function');
      expect(validate.childViews).to.have.length(1);
    });
    it('should throw for invalid childViews', function() {
      var fn1 = function() {
        validate.childViews({'.js-child': View});
      };
      var fn2 = function() {
        validate.childViews({'child': View});
      };
      expect(fn1).to.throw();
      expect(fn2).to.throw();
    });
    it('should not throw for valid childViews', function() {
      var fn = function() {
        validate.childViews({'js-child': View});
      };
      expect(fn).not.to.throw();
    });
    it('should throw for el presensce' , function() {
      var fn1 = function() {
        validate.childViews({'js-child': View.extend({
          el: 'someElement'
        })
       });
        expect(fn1).to.throw();
      };
    });
    it('should not throw for el absense' , function() {
      var fn1 = function() {
        validate.childViews({'js-child': View});
        expect(fn1).not.to.throw();
      };
    });
  });
});

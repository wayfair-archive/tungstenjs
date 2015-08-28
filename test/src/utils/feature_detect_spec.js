'use strict';

/* global describe, it, require */
'use strict';

var featureDetect = require('../../../src/utils/feature_detect.js');

describe('feature_detect.js public API', function() {
  describe('isiOS', function() {
    it('should be a function', function() {
      expect(featureDetect.isiOS).to.be.a('function');
    });

    var originalNavigator = global.navigator;

    it('should positively identify iPads', function() {
      global.navigator = {
        userAgent: 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10'
      };
      expect(featureDetect.isiOS()).to.be.true;
    });
    it('should positively identify iPhones', function() {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; nb-no) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148a Safari/6533.18.5'
      };
      expect(featureDetect.isiOS()).to.be.true;
    });
    it('should positively identify iPod', function() {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5'
      };
      expect(featureDetect.isiOS()).to.be.true;
    });

    it('should negatively identify Android', function() {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36'
      };
      expect(featureDetect.isiOS()).to.be.false;
    });

    it('should negatively identify IE', function() {
      global.navigator = {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)'
      };
      expect(featureDetect.isiOS()).to.be.false;
    });

    global.navigator = originalNavigator;
  });
});

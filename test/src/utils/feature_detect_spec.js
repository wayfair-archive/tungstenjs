'use strict';

var window = require('global/window');
var featureDetect = require('../../../src/utils/feature_detect.js');

describe('feature_detect.js public API', function() {
  beforeEach(function () {
    this.originalNavigator = window.navigator;
    window.navigator = {};
  });

  afterEach(function () {
    window.navigator = this.originalNavigator;
  });

  describe('isiOS', function() {
    it('should be a function', function() {
      expect(featureDetect.isiOS).to.be.a('function');
    });
    it('should not fail if navigator is not present', function() {
      window.navigator = null;
      expect(featureDetect.isiOS()).to.be.false;
    });
    it('should positively identify iPads', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10'
      };
      expect(featureDetect.isiOS()).to.be.true;
    });
    it('should positively identify iPhones', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; nb-no) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148a Safari/6533.18.5'
      };
      expect(featureDetect.isiOS()).to.be.true;
    });
    it('should positively identify iPod', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5'
      };
      expect(featureDetect.isiOS()).to.be.true;
    });
    it('should negatively identify Android', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36'
      };
      expect(featureDetect.isiOS()).to.be.false;
    });
    it('should negatively identify IE', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)'
      };
      expect(featureDetect.isiOS()).to.be.false;
    });
  });

  describe('isIE', function() {
    it('should be a function', function() {
      expect(featureDetect.isIE).to.be.a('function');
    });
    it('should not fail if navigator is not present', function() {
      window.navigator = null;
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should positively identify IE8', function() {
      window.navigator = {
        userAgent: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Win64; x64; Trident/4.0)'
      };
      expect(featureDetect.isIE()).to.be.true;
    });
    it('should positively identify IE 9', function() {
      window.navigator = {
        userAgent: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Trident/5.0)'
      };
      expect(featureDetect.isIE()).to.be.true;
    });
    it('should positively identify IE 10', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)'
      };
      expect(featureDetect.isIE()).to.be.true;
    });
    it('should positively identify IE 11', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko'
      };
      expect(featureDetect.isIE()).to.be.true;
    });
    it('should positively identify IE Edge', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136'
      };
      expect(featureDetect.isIE()).to.be.true;
    });
    it('should negatively identify Safari 8', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should negatively identify Yandex Browser', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 YaBrowser/1.7.1364.22194 Safari/537.22'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should negatively identify SeaMonkey', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 SeaMonkey/2.7.1'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should negatively identify Firefox', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:49.0) Gecko/20100101 Firefox/49.0'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should negatively identify Android', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 6P Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Mobile Safari/537.36'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should negatively identify Amazon Fire TV', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 4.2.2; AFTB Build/JDQ39) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.173 Mobile Safari/537.22'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should negatively identify Amazon Kindle 4', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (X11; U; Linux armv7l like Android; en-us) AppleWebKit/531.2+ (KHTML, like Gecko) Version/5.0 Safari/533.2+ Kindle/3.0+'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
    it('should negatively identify Chrome Desktop', function() {
      window.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
      };
      expect(featureDetect.isIE()).to.be.false;
    });
  });

  describe('supportsPassiveEventListeners', function() {
    var originalAddEventListener = window.addEventListener;

    afterEach(function() {
      window.addEventListener = originalAddEventListener;
    });

    it('should be a function', function() {
      expect(featureDetect.supportsPassiveEventListeners).to.be.a('function');
    });

    it('should pass when passive property was checked on options object', function() {
      window.addEventListener = function(type, listener, options) {
        options && options.passive;
      };
      expect(featureDetect.supportsPassiveEventListeners()).to.be.true;
    });

    it('should not pass when an error was thrown', function() {
      window.addEventListener = function(type, listener, options) {
        if (object.prototype.toString.call(options) === '[object Object]') {
          throw new Error();
        }
      };
      expect(featureDetect.supportsPassiveEventListeners()).to.be.false;
    });
  });
});

/* eslint-env browser */

'use strict';

const TungstenBackboneBase = require('tungstenjs');
const View = TungstenBackboneBase.View;
const Model = TungstenBackboneBase.Model;
const template = require('../templates/app_view.mustache');
const featureDetect = require('../../../src/utils/feature_detect');
let mutationObserved;

let AppView = View.extend({
  events: {
    'input .js-inputType': function(e) {
      this.model.changeNewType(e.currentTarget.value);
    }
  },
  postInitialize: function() {
    // IE 11+ or webkit browsers - use MutationObserver
    if (window.MutationObserver) {
      // using mutationObserve
      mutationObserved = true;
      const inputNode = this.el.getElementsByClassName('highlight')[0];
      const observer = new MutationObserver(
        mutations => mutations.forEach(
          mutation => this.model.changeActualType(mutation.target.getAttribute('type') || 'not set')
        )
      );
      observer.observe(inputNode, {
        attributes: true
      });
    }
    this.model.setBrowser(featureDetect.isIE() ? 'IE' : 'Not IE');
  },
  postRender: function() {
    // if MutationObserver is not used, get input's type attribute value after
    // DOM was rendered
    if (!mutationObserved) {
      let inputNode = this.el.getElementsByClassName('highlight')[0];
      this.model.changeActualType(inputNode.getAttribute('type') || 'not set');
    }
  }
});

let AppModel = Model.extend({
  defaults: {
    newType: 'text',
    actualType: 'text'
  },
  changeNewType: function(newType) {
    this.set('newType', newType);
  },
  changeActualType: function(actualType) {
    this.set('actualType', actualType);
  },
  setBrowser: function(value) {
    this.set('browser', value);
  }
});

window.app = module.exports = new AppView({
  el: document.getElementById('appwrapper'),
  template: template,
  model: new AppModel(),
  dynamicInitialize: true
});

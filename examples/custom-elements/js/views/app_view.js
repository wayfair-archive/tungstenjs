/**
* Custom Elements Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;

var AppView = View.extend({
  postInitialize: function() {
    window.addEventListener("WebComponentsReady", function() {
      var btn = document.getElementById('toggle-collapsible'),
        collapsible = document.getElementById('collapsible');

      btn.addEventListener('click', function() {
        collapsible.toggle();
        btn.setAttribute('aria-expanded', collapsible.opened ? 'true' : 'false');
      }, false);
    });
    console.log('app view initialized');
  }
}, {
  debugName: 'AppView'
});
module.exports = AppView;

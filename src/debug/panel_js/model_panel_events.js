'use strict';

var _ = require('underscore');
var logger = require('../../utils/logger');
var utils = require('./utils');
var appData = require('./app_data');

var getClosestModel = appData.getClosestModel = function(elem) {
  var model = null;
  var wrapper = utils.closest(elem, 'js-model-list-item');
  if (wrapper) {
    model = appData.models[wrapper.getAttribute('data-id')];
  }
  return model;
};

appData.updateSelectedModel = function() {
  if (typeof appData.selectedModel.obj.getPropertiesArray === 'function') {
    appData.selectedModel.modelProperties = appData.selectedModel.obj.getPropertiesArray();
  }
  utils.render();
};

module.exports = function() {
  utils.addEvent('js-toggle-model-children', 'click', function(e) {
    e.stopPropagation();
    var view = getClosestModel(e.target);
    view.collapsed = !view.collapsed;
    utils.render();
  });
  utils.addEvent('js-model-list-item', 'click', function(e) {
    appData.selectModel(getClosestModel(e.target));
  });
  utils.addEvent('js-more-model-info', 'click', function(e) {
    var model = getClosestModel(e.target).obj;
    logger.log(model);
  });
  utils.addEvent('js-model-property', 'click', function(e) {
    var key = utils.closest(e.currentTarget, 'js-model-property').getAttribute('data-key');
    var selectedProperty = _.findWhere(appData.selectedModel.modelProperties, {
      key: key
    });
    if (selectedProperty && !selectedProperty.data.isRelation && !selectedProperty.data.isEditing) {
      selectedProperty.data.isEditing = true;
      utils.render();
      utils.selectElements('js-model-property-value')[0].focus();
    }
  });
  utils.addEvent('js-model-property-value', 'blur', function(e) {
    var key = utils.closest(e.currentTarget, 'js-model-property').getAttribute('data-key');
    try {
      var value = JSON.parse(e.currentTarget.value);
      var selectedProperty = _.findWhere(appData.selectedModel.modelProperties, {
        key: key
      });
      selectedProperty.data.isEditing = false;
      selectedProperty.data.value = value;
      appData.selectedModel.obj.set(key, value);
      appData.updateSelectedModel();
    } catch (ex) {
      var message = 'Unable to parse "' + e.currentTarget.value + '" to a valid value. Input must match JSON format';
      utils.alert(message);
      logger.warn(message);
      utils.selectElements('js-model-property-value')[0].focus();
    }
  });
  utils.addEvent('js-model-property-value', 'keyup', function(e) {
    var which = (e.which || e.keyCode);
    if (which === 13) {
      e.currentTarget.blur();
    }
  });
  utils.addEvent('js-track-function', 'click', function(e) {
    var fnName = e.currentTarget.getAttribute('data-fn');
    var selectedFunction = _.findWhere(appData.selectedModel.objectFunctions, {
      name: fnName
    });
    selectedFunction.tracked = !selectedFunction.tracked;
    appData.selectedModel.toggleFunctionTracking(fnName, selectedFunction.tracked);
    utils.render();
  });
  utils.addEvent('js-show-inherited', 'change', function(e) {
    e.stopPropagation();
    appData.settings.showInheritedMethods = e.currentTarget.checked;
    utils.render();
  });
  utils.addEvent('js-add-new-event', 'blur', function(e) {
    var eventName = e.currentTarget.value;
    if (/^\s*$/.test(eventName)) {
      return;
    }
    var existing = _.findWhere(appData.selectedModel.customEvents, {
      name: eventName
    });
    if (!existing) {
      var listener = utils.addListener(appData.selectedModel.obj, eventName);
      appData.selectedModel.customEvents.push({
        name: eventName,
        listener: listener
      });
    }
    utils.render();
  });
  utils.addEvent('js-add-new-event', 'keyup', function(e) {
    var which = (e.which || e.keyCode);
    if (which === 13) {
      e.currentTarget.blur();
    }
  });
  utils.addEvent('js-untrack-event', 'click', function(e) {
    var eventName = utils.closest(e.currentTarget, 'js-tracked-event').getAttribute('data-key');
    var events = appData.selectedModel.customEvents;
    for (var i = 0; i < events.length; i++) {
      if (events[i].name === eventName) {
        utils.removeListener(appData.selectedModel.obj, events[i].name, events[i].listener);
        events.splice(i, 1);
        break;
      }
    }
    utils.render();
  });
  utils.addEvent('js-get-model-data', 'click', function() {
    appData.selectedModel.outputData = JSON.stringify(appData.selectedModel.obj);
    utils.render();
  });
  utils.addEvent('js-set-model-data', 'click', function() {
    var textbox = utils.selectElements('js-model-data')[0];
    appData.selectedModel.outputData = '';
    appData.selectedModel.obj.reset(JSON.parse(textbox.value));
    appData.updateSelectedModel();
  });
  utils.addEvent('js-reset-data', 'click', function() {
    appData.selectedModel.obj.reset(appData.selectedModel.obj.initialData);
    appData.updateSelectedModel();
  });
};

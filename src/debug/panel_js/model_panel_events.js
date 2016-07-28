'use strict';

var window = require('global/window');
var _ = require('underscore');
var logger = require('../../utils/logger');
var errors = require('../../utils/errors');
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
    var model = getClosestModel(e.target);
    model.collapsed = !model.collapsed;
    if (!model.collapsed) {
      appData.allModelsCollapsed = false;
    }
    utils.render();
  });
  utils.addEvent('js-collapse-all-models', 'click', function() {
    for (var model in appData.models) {
      model = appData.models[model];
      if (model.isParent()) {
        model.collapsed = !appData.allModelsCollapsed;
      }
    }
    appData.allModelsCollapsed = !appData.allModelsCollapsed;
    utils.render();
  });
  utils.addEvent('js-model-list-item', 'click', function(e) {
    appData.selectModel(getClosestModel(e.target));
  });
  utils.addEvent('js-more-model-info', 'click', function(e) {
    var model = getClosestModel(e.target).obj;
    logger.log(model);
  });
  utils.addEvent('js-derived-property', 'click', function(e) {
    var key = utils.closest(e.currentTarget, 'js-derived-property').getAttribute('data-key');
    var selectedProperty = _.findWhere(appData.selectedModel.modelProperties.derived, {
      key: key
    });
    if (selectedProperty) {
      logger.log(key, selectedProperty.data.isDerived.deps, selectedProperty.data.isDerived.fn);
    }
  });
  utils.addEvent('js-model-property', 'click', function(e) {
    var key = utils.closest(e.currentTarget, 'js-model-property').getAttribute('data-key');
    var selectedProperty = _.findWhere(appData.selectedModel.modelProperties.normal, {
      key: key
    });
    if (selectedProperty && !selectedProperty.data.isEditing) {
      selectedProperty.data.isEditing = true;
      utils.render();
      utils.selectElements('js-model-property-value')[0].focus();
    }
  });
  utils.addEvent('js-model-property-value', 'blur', function(e) {
    var key = utils.closest(e.currentTarget, 'js-model-property').getAttribute('data-key');
    try {
      var value = JSON.parse(e.currentTarget.value);
      var selectedProperty = _.findWhere(appData.selectedModel.modelProperties.normal, {
        key: key
      });
      selectedProperty.data.isEditing = false;
      selectedProperty.data.value = value;
      appData.selectedModel.obj.set(key, value);
      appData.updateSelectedModel();
    } catch (ex) {
      errors.unableToParseToAValidValueMustMatchJSONFormat(e.currentTarget.value);
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
  utils.addEvent('js-remove-attribute', 'click', function(e) {
    e.stopPropagation();
    appData.selectedModel.obj.unset(e.currentTarget.getAttribute('data-key'));
    appData.updateSelectedModel();
  });
  utils.addEvent('js-add-attribute', 'click', function() {
    appData.settings.modelProperties = appData.settings.modelProperties || {};
    appData.settings.modelProperties.adding = true;
    utils.render();
  });
  utils.addEvent('js-cancel-adding-attribute', 'click', function() {
    appData.settings.modelProperties = appData.settings.modelProperties || {};
    appData.settings.modelProperties.adding = false;
    utils.render();
  });
  utils.addEvent('js-adding-attribute', 'submit', function(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var name = form.name.value;
    var value;
    try {
      value = JSON.parse(form.value.value);
    } catch (ex) {
      value = form.value.value;
    }
    var model = appData.selectedModel.obj;
    if (model.has(name)) {
      window.alert('Model already has property named "' + name + '"');
    } else {
      model.set(name, value);
      appData.settings.modelProperties = appData.settings.modelProperties || {};
      appData.settings.modelProperties.adding = false;
      appData.updateSelectedModel();
    }
  });
};

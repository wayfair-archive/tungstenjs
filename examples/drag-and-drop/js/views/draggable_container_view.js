'use strict';

var _ = require('underscore');
var dragula = require('dragula');
var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseView = TungstenBackboneBase.View;

var DraggableContainerView = BaseView.extend({
  postInitialize: function () {
    var self = this;
    var container = this.el;
    var drake = dragula([container]);
    var originIndex;
    var destinationIndex;
    var collection = primaryCollection([self.model]);

    /**
     * Breadth-first search for first collection
     */
    function primaryCollection (models) {
      var childModels = [];

      if (!models.length) {
        return null;
      }

      for (var i = 0; i < models.length; i++) {
        var model = models[i];
        var keys = model.keys();

        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];

          if (model.get(key).tungstenCollection) {
            return model.get(key);
          } else if (model.get(key).tungstenModel) {
            childModels.push(model.get(key));
          }
        }
      }

      primaryCollection(childModels);
    }

    drake.on('drag', function (el) {
      originIndex = _.indexOf(container.childNodes, el);
    });

    drake.on('drop', function (el, target, source, sibling) {
      var dragEls = [];
      var childViews = self.getChildViews();
      for (var i = 0; i < childViews.length; i++) {
        dragEls.push(childViews[i].el);
      };
      var originCollectionIndex = _.indexOf(dragEls, el);
      var dragModel = collection.at(originCollectionIndex);

      destinationIndex = _.indexOf(container.childNodes, el);

      /**
       * Because Dragula moves elements around there are cases where text nodes (whitespace)
       * that come after something that moves doesn't itself move, causing
       * DOM / VDOM mismatches. The solution here is to move the text node along with the
       * draggable element so that it remains after it in the DOM at the destination.
       */
      var whitespaceIndex = originIndex < destinationIndex ? originIndex : originIndex + 1;
      if (container.childNodes[whitespaceIndex].nodeType === Node.TEXT_NODE) {
        container.insertBefore(container.childNodes[whitespaceIndex], container.childNodes[destinationIndex + 1]);
      }

      collection.remove(dragModel);
      dragEls.splice(originCollectionIndex, 1);

      var destinationCollectionIndex = _.indexOf(dragEls, sibling);
      collection.add(dragModel, {at: destinationCollectionIndex});
      dragEls.splice(destinationCollectionIndex, 0, el);

      self.trigger('draggableContainerChange', collection, originCollectionIndex, destinationCollectionIndex);
    });

    /**
     * Needed to fix the whitespace issue with Dragula + Tungsten.
     */
    drake.on('cancel', function () {
      if (container.childNodes[originIndex].nodeType === Node.TEXT_NODE && container.childNodes[originIndex + 2]) {
        container.insertBefore(container.childNodes[originIndex], container.childNodes[originIndex + 2]);
      }
    });
  }
}, {
  debugName: 'DraggableContainerView'
});

module.exports = DraggableContainerView;

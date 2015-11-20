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
      var dragModel = collection.at(_.indexOf(dragEls, el));

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
      dragEls.splice(_.indexOf(dragEls, el), 1);

      collection.add(dragModel, {at:_.indexOf(dragEls, sibling)}); 
      dragEls.splice(_.indexOf(dragEls, sibling), 0, el);
    });
  }
}, {
  debugName: 'DraggableContainerView'
});

module.exports = DraggableContainerView;

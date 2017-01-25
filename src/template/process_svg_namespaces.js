const _ = require('underscore');
const svgAttributeNamespace = require('virtual-dom/virtual-hyperscript/svg-attribute-namespace');
const AttributeHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook');

module.exports = function processSvgNamespace(properties) {
  if (!properties || !properties.attributes) {
    return properties;
  }

  let namespacedAttrs = {};
  let props = _.create(properties);
  props.attributes = namespacedAttrs;

  let attributes = properties.attributes;
  for (let attrName in attributes) {
    if (attrName !== 'namespace') {
      let namespace = svgAttributeNamespace(attrName);
      if (namespace) {
        // Hooks need to be moved to the top object to be processed
        props[attrName] = new AttributeHook(namespace, attributes[attrName]);
      } else {
        namespacedAttrs[attrName] = attributes[attrName];
      }
    }
  }

  return props;
};

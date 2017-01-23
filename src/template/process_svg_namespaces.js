const svgAttributeNamespace = require('virtual-dom/virtual-hyperscript/svg-attribute-namespace');
const AttributeHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook');

module.exports = function processSvgNamespace(attributes) {
  if (!attributes) {
    return attributes;
  }

  let namespaced = {};
  for (let attrName in attributes) {
    let namespace = svgAttributeNamespace(attrName);
    if (namespace) {
      namespaced[attrName] = new AttributeHook(namespace, attributes[attrName]);
    } else {
      namespaced[attrName] = attributes[attrName];
    }
  }

  return namespaced;
};

/**
 * Forked from https://github.com/fb55/entities
 */

import decodeCodePoint from 'entities/lib/decode_codepoint.js';
import entityMap from 'entities/maps/entities.json';
import types from '../types';
import legacyMap from 'entities/maps/legacy.json';

module.exports = (function() {
  var legacy = Object.keys(legacyMap)
    .sort(sorter);

  var keys = Object.keys(entityMap)
    .sort(sorter);

  for (var i = 0, j = 0; i < keys.length; i++) {
    if (legacy[j] === keys[i]) {
      keys[i] += ';?';
      j++;
    } else {
      keys[i] += ';';
    }
  }

  var re = new RegExp('&(?:' + keys.join('|') + '|#[xX][\\da-fA-F]+;?|#\\d+;?)', 'g'),
    replace = getReplacer(entityMap);

  var marker;
  var replacements;
  function replacer(str) {
    if (str.substr(-1) !== ';') {
      str += ';';
    }
    replacements.push([str, replace(str)]);
    return marker;
  }

  function atMarker(str, index) {
    if (str.charAt(index) !== '`') {
      return false;
    }
    for (var i = 1; i < marker.length; i++) {
      if (str.charAt(index + i) !== '`') {
        return false;
      }
    }
    return true;
  }

  return function(str) {
    str = String(str);
    marker = '``';
    replacements = [];
    while (str.indexOf(marker) > -1) {
      marker += '`';
    }
    // @TODO improve
    var decoded = String(str).replace(re, replacer);
    if (replacements.length === 0) {
      return [str];
    }

    var map = [];
    var buffer = '';
    var replacementIndex = 0;
    for (var i = 0; i < decoded.length; i++) {
      if (!atMarker(decoded, i)) {
        buffer += decoded.charAt(i);
      } else {
        map.push(buffer);
        buffer = '';
        i += marker.length - 1;
        var replace = replacements[replacementIndex++];
        map.push({
          type: types.TEXT,
          original: replace[0],
          value: replace[1]
        });
      }
    }
    if (buffer) {
      map.push(buffer);
    }

    return map;
  };
}());

function sorter(a, b) {
  return a < b ? 1 : -1;
}

function getReplacer(map) {
  return function replace(str) {
    if (str.charAt(1) === '#') {
      if (str.charAt(2) === 'X' || str.charAt(2) === 'x') {
        return decodeCodePoint(parseInt(str.substr(3), 16));
      }
      return decodeCodePoint(parseInt(str.substr(2), 10));
    }
    return map[str.slice(1, -1)];
  };
}
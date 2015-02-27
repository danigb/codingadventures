'use strict';

var parse = require('./parse.js');

// Pattern
// -------
// **pattern** is a array of tokens with durations

function reduceDurations(ast, position, duration, flat) {
  return ast.reduce(function(flat, toFlatten) {
    var event = Array.isArray(toFlatten) ?
      reduceDurations(toFlatten, position, (duration / toFlatten.length), []) :
      {token: toFlatten, position: position, duration: duration};
    position += duration;
    return flat.concat(event);
  }, flat);
}

var pattern = function(text, duration, flat) {
  return reduceDurations(parse(text), 0, duration || 1.0, flat || []);
}

module.exports = pattern;

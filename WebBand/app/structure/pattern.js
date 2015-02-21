'use strict';

var parse = require('./parse.js');

// Pattern
// -------
// **pattern** is a array of tokens with durations

function reduceDurations(ast, duration, flat) {
  return ast.reduce(function(flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ?
      reduceDurations(toFlatten, (duration / toFlatten.length), []) :
      {token: toFlatten, duration: duration});
  }, flat);
}

var pattern = function(text, duration, flat) {
  return reduceDurations(parse(text), duration || 1.0, flat || []);
}

module.exports = pattern;

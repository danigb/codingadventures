
var teoria = require('teoria');
var Sequence = require('./sequence.js');
var Bassist = {};

Bassist.roots = function(src, options) {
  options = options || {};
  var duration = options.duration || 0.25;

  var dest = new Sequence();
  src.forEach(function(chord) {
    var times = Math.floor(chord.duration / duration);
    var root = teoria.chord(chord.value).root;
    var position = chord.position;
    for(var i = 0; i < times; i++) {
      dest.addEvent(position, duration, root);
      position += duration;
    }
  });
  return dest;
}

module.exports = Bassist;

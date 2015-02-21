'use strict';

var sequence = require('../sequencer/sequence.js');
var pattern = require('../structure/pattern.js');

// Player
// ------
// The simplest player. Just play notes
function notePlayer(input, options) {
  options = options || {};
  var velocity = options.velocity || 0.8;
  var pos = 0;

  return pattern(input).reduce(function(seq, note) {
    seq.addNote(note.token, {start: pos, length: note.duration});
    pos += note.duration;
    return seq;
  }, sequence());
};

module.exports = notePlayer;

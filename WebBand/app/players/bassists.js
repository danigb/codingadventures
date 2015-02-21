'use strict';

var sequence = require('../sequencer/sequence.js');

var bassists = {};

// Root Bass Player
// ----------------
// Plays the roots of each chords

bassists.rootNotePlayer = function(pattern, options) {
  options = options || {};
  var rootDuration = options.duration || 0.25;

  return pattern.reduce(function(seq, chord) {
    var times = Math.floor(chord.duration / rootDuration);
    var pos = 0;
    for(var i = 0; i < times; i++) {
      seq.addNote(chord.token, {start: pos, length: rootDuration});
      pos += rootDuration;
    }
    return seq;
  }, sequence());
}

module.exports = bassists;

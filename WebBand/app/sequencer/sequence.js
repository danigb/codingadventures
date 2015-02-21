'use strict';

// Sequence
// --------
// **sequences** are ordered list of events

function position(time) {
  return { measure: 0, beat: 0, delay: 0};
};

function sequence() {
  var seq = {};
  seq.events = [];

  seq.eventsCount = function() { return seq.events.length; }

  seq.addNote = function(name, options) {
    var start = options.start || 0;
    var duration = options.duration || 0.25;
    var velocity = options.velocity || 1;

    seq.events.push({type: 'NoteOn', noteName: name,
      position: position(start), velocity: velocity});
    seq.events.push({type: 'NoteOff', noteName: name,
      position: position(start + duration) })
      
  }

  return seq;
};

module.exports = sequence;

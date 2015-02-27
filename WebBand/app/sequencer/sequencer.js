'use strict';

// Sequencer
// ---------

// how many milliseconds we look ahead time
var lookahead = 0.25;

var currentTick;

// when we should fire next tick
var nextTickTime;

// The Sequencer object api
var sequencer = {};

// Number of beats per minute
var sequencer.tempo = 120;

// Play a sequence of events
sequencer.play = function(sequence, time) {
  nextTickTime = time || ctx.currentTime();


}

module.exports = sequencer;

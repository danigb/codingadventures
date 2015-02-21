'use strict';

// Arrangement
// -----------
// An **arrangement** is a materialization of a sheet
// Options:
// - tempo: defaults to 120
function arrangement(sheet, options) {
  var arr = {};
  arr.tempo = options.tempo || 120;
  arr.sheet = sheet;
  arr.tracks = {}

  // Add a track to an arrangement
  // Options:
  // - instrument: (required) instrument used to play the sequence
  // - player: (required) player used to convert the part into a sequence
  // - part: (required) part name of the sheet
  // - sections: (required) the sections to be played
  arr.track = function(name, options) {
    if (arguments.length == 1) return arr.tracks[name];

    var track = arr.tracks[name] = {
      instrument: options.instrument,
      player: options.player,
      part: options.part,
      sections: options.sections
    }
    track.sequence = null;
    return arr;
  }

  return arr;
}

module.exports = arrangement;

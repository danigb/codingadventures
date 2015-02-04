(function(realbook) {
  'use strict';

  function reduce(a, initial, callback) {
    var i = initial;
    a.forEach(function(item) {
      i = callback(i, item);
    });
    return i;
  }

  function toTime(secs) {
    var divisor_for_minutes = secs % (60 * 60);
    return { h: Math.floor(secs / (60 * 60)),
             m: Math.floor(divisor_for_minutes / 60),
             s: Math.ceil(divisor_for_minutes % 60)};
  }

  realbook.song = function(title, structure) {
    var song = realbook.observable({});
    var harmonyCtx = {note: 'C', mode: 'major'}
    var tempo = 120;
    var signature = { beats: 4, subdivision: 4 };
    var parts = {};

    song.title = function() { return title; }
    song.signature = function() { return signature; }
    song.parts = function() { return parts; }
    song.structure = structure.split('');
    song.selected = { type: 'song', object: song };


    song.part = function(partName, value) {
      if (arguments.length == 1) return parts[partName];

      var part = { };
      part.measures = value.split('|').map(function(chords) {
        return { chords: chords, selected: false};
      }).map(function(measure) {
        return realbook.observable(measure, {
          'changed': function() {
            if (measure.selected) {
              song.select('measure', measure);
            }
            song.trigger('changed');
          }
        });
      });
      part.length = part.measures.length;

      parts[partName] = part;
      return song;
    }
    song.select = function(type, object) {
      if(!arguments.length) return song.selected;
      console.log("SELECT", type, object);
      song.selected = {type: type, object: object};
      return song;
    }
    song.tempo = function(newTempo) {
      if (!arguments.length) return tempo;
      tempo = newTempo;
      return song;
    }
    song.length = function() {
      return reduce(song.structure, 0, function(acc, part) {
        return acc + parts[part].length;
      });
    }

    song.time = function() {
      return toTime(60 / tempo * signature.beats * song.length())
    }
    return song;
  }

})(window.realbook);

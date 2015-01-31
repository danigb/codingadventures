(function() {
  'use strict';

  function reduce(a, initial, callback) {
    var i = initial;
    a.forEach(function(item) {
      i = callback(i, item);
    });
    return i;
  }

  function song(title, structure) {
    var harmonyCtx = {note: 'C', mode: 'major'}
    var tempo = 120;
    var signature = { beats: 4, subdivision: 4 };
    var song = {};
    var parts = {}

    song.title = function() { return title; }
    song.signature = function() { return signature; }
    song.parts = function() { return parts; }
    song.structure = structure.split('');

    song.part = function(partName, value) {
      if (arguments.length == 1) return parts[partName];

      var part = { };
      part.measures = value.split('|').map(function(chords) {
        return { chords: chords, selected: false};
      });
      part.length = part.measures.length;

      parts[partName] = part;
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

    function toTime(secs) {
      var divisor_for_minutes = secs % (60 * 60);
      return { h: Math.floor(secs / (60 * 60)),
               m: Math.floor(divisor_for_minutes / 60),
               s: Math.ceil(divisor_for_minutes % 60)};
    }

    song.time = function() {
      return toTime(60 / tempo * signature.beats * song.length())
    }
    return song;
  }

  function time(tempo, signature, measures) {
    var secs = 60 / tempo * signature.beats * measures;

  }

  var h = virtualDom.h;
  function render(parent, song) {

    function renderMeasure(measure) {
      return h("div.measure", {
        onclick: function() {
          console.log("clicked: ", measure);
        }
      }, [h("a", measure.chords)]);
    }

    function renderPart(partName) {
      var part = song.part(partName);
      return h("div.part", part.measures.map(renderMeasure));
    }

    function renderSheet(song) {
      return h("div.sheet", song.structure.map(renderPart));
    }

    function renderInfo(song) {
      var time = song.time();
      return [
        h("h2", song.title()),
        h("div.info", [
          h("span.bpm", "" + song.tempo() + "bpm /"),
          h("span.structure", " " + song.structure.join('') + " /"),
          h("span.measures", " " + song.length() + " measures /"),
          h("span.time", " " + time.m + ":" + time.s)
        ])
      ];
    }

    function renderSong(song) {
      return h("div.song", [renderInfo(song), renderSheet(song)]);
    }


    var rootNode = virtualDom.create(renderSong(song));
    parent.appendChild(rootNode);

    console.log(song);
    console.log(song.length());
    console.log(song.time());
  }



  window.onload = function() {
    var $songs = document.getElementById('songs');
    var s = song("All of me", "AB").tempo(100)
      .part("A", "Cmaj7|%|E7|%|A7|%|Dm|%|E7|%|Am|%|D7|%|Dm7|G7")
      .part("B", "Cmaj7|%|E7|%|A7|%|Dm|%|F|Fm|Cmaj7 Em7|A7|Dm7|G7|C6|%");

    render($songs, s);
  }
})();

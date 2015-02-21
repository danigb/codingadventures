
'use strict';

var soundfont = require('./instruments/soundfont.js');
var sheet = require('./structure/sheet.js');
var pattern = require('./structure/pattern.js');
var arrangement = require('./structure/arrangement.js');
var notePlayer = require('./players/notePlayer.js');
var bassists = require('./players/bassists.js');
var sequencer = require('./sequencer/sequencer.js');

var ctx = new AudioContext();
var allOfMe = sheet('All of me').part('chords', {
  A: 'Cmaj7|%|E7|%|A7|%|Dm|%|E7|%|Am|%|D7|%|Dm7|G7',
  B: 'Cmaj7|%|E7|%|A7|%|Dm|%|F|Fm|(Cmaj7 Em7)|A7|Dm7|G7|C6|%'
});

window.addEventListener('load', function() {
  soundfont(ctx, 'acoustic_grand_piano').then(function(piano) {
    console.log("Instrument ready", piano);

    var arr = arrangement({tempo: 110});
    arr.track('bass', piano, sequence);


    var a2 = arrangement({tempo: 80})
      .track('piano', piano, notePlayer('(c3 d3 e3 f3)(g3 a3 b3 c4)'));

  })
});

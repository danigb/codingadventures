//= require realbook/init
//= require realbook/observable
//= require realbook/models
//= require realbook/views

(function() {
  'use strict';
  var RB = window.realbook;

  window.onload = function() {
    var $songs = document.getElementById('songs');
    var s = RB.song("All of me", "AB").tempo(100)
      .part("A", "Cmaj7|%|E7|%|A7|%|Dm|%|E7|%|Am|%|D7|%|Dm7|G7")
      .part("B", "Cmaj7|%|E7|%|A7|%|Dm|%|F|Fm|Cmaj7 Em7|A7|Dm7|G7|C6|%");

    RB.render(s, $songs);
  }
})();

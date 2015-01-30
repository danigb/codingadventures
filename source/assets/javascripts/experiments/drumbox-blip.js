(function() {
  'use strict';
  var drumbox = {};

  // Sequence: model and ui
  drumbox.sequence = function(root, names, length) {
    var sequence = {};
    var beats = [];
    var current = [];

    // Create HTML element
    function h(name, id, className) {
      var e = document.createElement(name);
      e.id = id;
      e.className = className;
      return e;
    }

    function createStep($row, name, step) {
      var $step = h('div', 'step-' + name + '-' + step, 'step');
      var step = {sample: name, step: step, mute: true, $e: $step};
      $step.onclick = function() {
        step.mute = !step.mute;
        $step.classList.toggle('on')
      };
      $row.appendChild($step);
      return step;
    }

    function createRows() {
      names.forEach(function(name) {
        var $row = h('div', "row-" + name, 'row')
        for (var s = 0; s < length; s++) {
          beats[s] = beats[s] || [];
          beats[s].push(createStep($row, name, s));
        }
        root.appendChild($row);
      });
    }

    function animate() {

    }

    sequence.eachStep = function(tick, callback) {
      current = tick >= 0 ? beats[tick % length] : [];
      current.forEach(callback);
      return sequence;
    }

    sequence.animate = function(tick) {

    }

    createRows();
    return sequence;
  }

  var SAMPLES = { openhat:    '/assets/sounds/maehat2.wav',
                  closedhat:  '/assets/sounds/maehat1.wav',
                  snare:      '/assets/sounds/maesnare.wav',
                  kick:       '/assets/sounds/maekick.wav'};
  var TRACKS = ['openhat', 'closedhat', 'snare', 'kick'];

  window.onload = function() {
    var samples = {};
    blip.sampleLoader().samples(SAMPLES).done(function() {
      TRACKS.forEach(function(track) {
        samples[track] = blip.clip().sample(track);
      });
      console.log("samples: ", samples);
    }).load();


    var $seq = document.getElementById('drumbox');
    var $play = document.getElementById('play');

    var sequence = drumbox.sequence($seq, TRACKS, 16);

    var stepsOn = function(step) { step.$e.classList.add('active'); }
    var stepsOff = function(step) { step.$e.classList.remove('active'); }

    var tick = 0;
    var player = blip.loop().tempo(200).tick(function(time) {
      requestAnimationFrame(function() {
        sequence.eachStep(tick - 1, stepsOff);
        sequence.eachStep(tick, stepsOn);
      });
      sequence.eachStep(tick, function(step) {
        if (!step.mute) {
          console.log("time", time, +new Date());
          samples[step.sample].play(time);
        }
      });
      tick++;
    });

    var running = false;
    $play.onclick = function() {
      if (!running) {
        tick = -1;
        player.start();
        $play.className = 'button-stop';
      } else {
        player.stop();
        sequence.eachStep(tick, stepsOff);
        $play.className = 'button-play';
      }
      running = !running;
    }
  }
})();

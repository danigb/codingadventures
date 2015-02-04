(function() {
  'use strict';
  var drumbox = {};

  // SAMPLER: load and play sounds
  drumbox.sampler = function(ctx, samples) {
    var buffers = {};
    var sampler = {};

    sampler.load = function(name, url) {
      var req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "arraybuffer";
      req.onload = function() {
        ctx.decodeAudioData(req.response,
          function(buffer) {
            buffers[name] = buffer;
          }, function(error) {
            console.log("Error decoding sample:", name, error);
        });
      }
      req.onerror = function(error) {
        console.log("Error loading sample:", name, error)
      }
      req.send();
    }

    sampler.play = function(name, time) {
      time = time || 0;
      if(buffers[name]) {
        var source = ctx.createBufferSource();
        source.buffer = buffers[name];
        source.connect(ctx.destination);
        source.start(time);
      }
    }

    for(name in samples) {
      sampler.load(name, samples[name]);
    }
    return sampler;
  }

  // SCHEDULER
  drumbox.scheduler = function(ctx) {
    var ticksPerBeat, tempo, secondsPerTicks, nextTick, nextTickTime;
    var scheduleThreshold = 0.1;
    var tickIntervalMs = 1000 * scheduleThreshold;
    var timerID = null;
    var play = function(tick, time) {};
    var scheduler = {};

    function schedule() {
      while(nextTickTime - ctx.currentTime < scheduleThreshold) {
        play(nextTick, nextTickTime);
        nextTick++;
        nextTickTime += secondsPerTicks;
      }
    }

    scheduler.tempo = function(tempo, subdivision) {
      if (!arguments.length) return tempo;
      tempo = 120;
      ticksPerBeat = subdivision || 4;
      secondsPerTicks = 60.0 / (tempo * ticksPerBeat)
      return scheduler;
    }

    scheduler.isRunning = function() {
      return timerID != null;
    }

    scheduler.start = function(callback) {
      if (!scheduler.isRunning()) {
        play = callback;
        nextTick = 0;
        nextTickTime = ctx.currentTime + 0.1;
        timerID = setInterval(schedule, tickIntervalMs);
      }
      return scheduler;
    }

    scheduler.stop = function() {
      if (scheduler.isRunning()) {
        clearInterval(timerID);
        timerID = null;
      }
      return scheduler;
    }

    scheduler.tempo(120);
    return scheduler;
  }

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

    sequence.eachStep = function(tick, callback) {
      current = tick >= 0 ? beats[tick % length] : [];
      current.forEach(callback);
      return sequence;
    }

    createRows();
    return sequence;
  }

  var SAMPLES = { openhat:    '/assets/sounds/maehat2.wav',
                  closedhat:  '/assets/sounds/maehat1.wav',
                  snare:      '/assets/sounds/maesnare.wav',
                  kick:       '/assets/sounds/maekick.wav'};

  window.onload = function() {
    var ctx = new AudioContext();
    var sampler = drumbox.sampler(ctx, SAMPLES);
    var scheduler = drumbox.scheduler(ctx);

    var $seq = document.getElementById('drumbox');
    var $play = document.getElementById('play');

    var sequence = drumbox.sequence($seq, ['openhat', 'closedhat', 'snare', 'kick'], 16);

    var stepsOn = function(step) { step.$e.classList.add('active'); }
    var stepsOff = function(step) { step.$e.classList.remove('active'); }
    var playSteps = function(step) { if (!step.mute) sampler.play(step.sample); }

    var currentTick = -1;
    var player = function(tick, time) {
      requestAnimationFrame(function() {
        sequence.eachStep(tick - 1, stepsOff);
        sequence.eachStep(tick, stepsOn);
      });
      sequence.eachStep(tick, playSteps);
      currentTick = tick;
    }

    $play.onclick = function() {
      if (scheduler.isRunning()) {
        sequence.eachStep(currentTick, stepsOff);
        scheduler.stop();
        $play.className = 'button-play';
      } else {
        scheduler.start(player);
        $play.className = 'button-stop';
      }
    }
  }
})();

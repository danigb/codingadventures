(function(export) {
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
})(window);

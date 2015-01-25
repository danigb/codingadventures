(function() {
  'use strict';

  function createLogistic(c, init) {
    var value = init;
    return (function* logistic() {
      while (true) {
        value = c * value * (1 - value);
        yield value;
      }
    })();
  }

  const WIDTH = 600;
  const HEIGHT = 400;
  const INITIAL = 0.1;
  const MIN_C = 3.5;
  const MAX_C = 4.0;
  const SKIP = 50;

  const FACTOR = (MAX_C - MIN_C) / WIDTH;

  function createStream() {
    return Rx.Observable.range(0, WIDTH, Rx.Scheduler.requestAnimationFrame)
    .map(function(xOffset) {
      var C = xOffset * FACTOR + MIN_C;
      return {
        xOffset: xOffset,
        stream: Rx.Observable.from(createLogistic(C, INITIAL))
                    .skip(SKIP)
                    .take(HEIGHT)
      };
    });
    //.observeOn(Rx.Scheduler.requestAnimationFrame);
  }

  var ctx;
  function draw(logistic) {
    logistic.stream.subscribe(function(value) {
      ctx.fillRect(logistic.xOffset, HEIGHT * (1 - value), 1, 1);
    });
  }

  window.onload = function() {
    var canvas = document.getElementById('logistic');
    ctx = canvas.getContext('2d');
    createStream().subscribe(draw);
  }
})();

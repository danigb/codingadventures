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

  function linearProjection(srcScaleMin, srcScaleMax, destScaleMin, destScaleMax) {
    var factor = (destScaleMax - destScaleMin) / (srcScaleMax - srcScaleMin);
    return function(value) {
      return (value - srcScaleMin) * factor + destScaleMin;
    }
  }

  const WIDTH = 600;
  const HEIGHT = 400;
  const INITIAL = 0.1;
  const MIN_C = 3.5;
  const MAX_C = 4.0;
  const SKIP = 50;

  const FACTOR = (MAX_C - MIN_C) / WIDTH;

  function drawLogistic(ctx) {

    var widthStream = Rx.Observable.range(0, WIDTH);
    var logicFunctionStream = widthStream.concatMap(function(xOffset) {
      var C = xOffset * FACTOR + MIN_C;
      return Rx.Observable.from(createLogistic(C, INITIAL))
      .map(function(x) {
        return {offset: xOffset, value: x, const: C, factor: FACTOR };
      })
      .skip(SKIP)
      .take(HEIGHT);
    });

    var stream = logicFunctionStream.take(WIDTH * HEIGHT);
    stream.subscribe(function(point) {
      ctx.fillRect(point.offset, HEIGHT * (1 - point.value), 1, 1);
    });
  }


  window.onload = function() {
    var canvas = document.getElementById('logistic');
    var ctx = canvas.getContext('2d');
    drawLogistic(ctx);
  }
})();

(function() {
  'use strict';

  function logisticGen(c, init) {
    var value = init;
    return (function* logistic() {
      while (true) {
        value = c * value * (1 - value);
        yield value;
      }
    })();
  }

  var WIDTH = 600;
  var HEIGHT = 400;
  var INITIAL = 0.1;
  var MIN_C = 3.5;
  var MAX_C = 4.0;
  var SKIP = 50;

  var FACTOR = (MAX_C - MIN_C) / WIDTH;

  window.onload = function() {
    var canvas = document.getElementById('logistic');
    var ctx = canvas.getContext('2d');

    function renderColumn(xOffset) {
      var C = xOffset * FACTOR + MIN_C;
      var logistic = Rx.Observable.from(logisticGen(C, 0.1)).skip(50).take(10);
      var pixels = logistic.map(function(v) {
        var x = xOffset;
        var y = HEIGHT * (1 - v);
        var color = "hsl(" + (360 * v) + ", 80%, 50%)"
        return { x: x, y: y, color: color }
      });
      return pixels;
    }
    function draw(pixel) {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    }

    var offsets = Rx.Observable.range(0, WIDTH, Rx.Scheduler.requestAnimationFrame);
    var columns = offsets.map(renderColumn)
    var pixels = columns.flatMap();
    pixels.subscribe(function(pixel) {
      draw(pixel);
    });
  }
})();

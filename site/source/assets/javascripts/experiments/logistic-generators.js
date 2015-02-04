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
  const SKIP = 50;
  const INITIAL = 0.1;
  function linear(srcScaleMin, srcScaleMax, destScaleMin, destScaleMax) {
    var factor = (destScaleMax - destScaleMin) / (srcScaleMax - srcScaleMin);
    return function(value) {
      return (value - srcScaleMin) * factor + destScaleMin;
    }
  }

  var xToC = linear(0, WIDTH, 3.5, 4.0);
  var canvas, ctx;

  var generator = (function *logisticPaths() {
    var value;
    for(var x = 0; x < WIDTH; x++) {
      var logistic = createLogistic(xToC(x), INITIAL);
      for (var i = 0; i < SKIP; i++) {
        logistic.next();
      }
      for (var i = 0; i < HEIGHT + SKIP; i++) {
        value = logistic.next().value;
        yield {x: x, y: value * HEIGHT, color: '#C00'};
      }
    }
  })();

  var point;
  const SPEED = 400;
  function animate() {
    for(var i = 0; i < SPEED; i++) {
      point = generator.next().value;
      if (point) {
        ctx.fillStyle = point.color;
        ctx.fillRect(point.x, point.y, 1, 1);
      } else {
        return;
      }
    }
    requestAnimationFrame(animate);
  }

  window.onload = function() {
    canvas = document.getElementById('logistic');
    if (canvas) {
      ctx = canvas.getContext("2d");
      requestAnimationFrame(animate);
    }
  }


})();

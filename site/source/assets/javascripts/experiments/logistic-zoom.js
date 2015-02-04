(function() {
  'use strict';

  // **** UTILITY
  function linear(srcScaleMin, srcScaleMax, destScaleMin, destScaleMax) {
    var factor = (destScaleMax - destScaleMin) / (srcScaleMax - srcScaleMin);
    return function(value) {
      return (value - srcScaleMin) * factor + destScaleMin;
    }
  }

  //**** FRACTAL
  const INITIAL = 0.1;
  function logistic(c, init) {
    var value = init;
    return (function* logistic() {
      while (true) {
        value = c * value * (1 - value);
        yield value;
      }
    })();
  }

  // **** IMAGE
  const WIDTH = 600;
  const HEIGHT = 400;
  const SKIP = 50;
  var xToC;
  var canvas, ctx;

  function scale(c1, c2) {
    xToC = linear(0, WIDTH, c1, c2);
    document.getElementById('C1').innerHTML = c1;
    document.getElementById('C2').innerHTML = c2;
  }

  function take(stream, count, callback) {
    for(var i = 0; i < count; i++) {
      callback(stream.next(), i);
    }
  }

  function valueToColor(value) {

  }

  function *pixelsStream(iterations) {
    var value;
    for(var x = 0; x < WIDTH; x++) {
      var stream = logistic(xToC(x), INITIAL);

      take(stream, 50, function() {});
      take(stream, 100, function() {

      });
      for (var i = 0; i < iterations; i++) {
        value = stream.next().value;
        var hue = 360 * value;
        yield {x: x, y: value * HEIGHT, color: "hsl(" + hue + ", 80%, 50%)"};
      }
    }
  }

  function clearCanvas(ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // ***** ANIMATION
  const SPEED = HEIGHT * 10;
  var running = false;
  function start() {
    running = true;
    var pixel;
    clearCanvas(ctx);
    var pixels = pixelsStream(iterations);
    (function animate() {
      if (!running) return;
      for(var i = 0; i < SPEED; i++) {
        pixel = pixels.next().value;
        if (pixel) {
          ctx.fillStyle = pixel.color;
          ctx.fillRect(pixel.x, pixel.y, 1, 1);
        } else {
          running = false;
          return;
        }
      }
      requestAnimationFrame(animate);
    })();
  }
  function stop() { running = false; }

  // **** ZOOM
  function zoomable(canvas, handleZoom) {
    var first, second;

    function whenTwo(pixel, callback) {
      if (first == null || second != null) {
        first = pixel;
        second = null;
      } else {
        second = pixel;
        callback(first, second);
      }
    }

    canvas.onclick = function(event) {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      whenTwo({x: x, y: y}, handleZoom);
    }

  }

  // **** SETUP
  var C1 = 3.5;
  var C2 = 4.0;
  window.onload = function() {
    canvas = document.getElementById('logistic');
    ctx = canvas.getContext("2d");

    zoomable(canvas, function(a, b) {
      stop();
      if (a.x == b.x) {
        scale(C1, C2);
      } else {
        scale(xToC(a.x), xToC(b.x));
      }
      start();
    });
    scale(3.5, 4.0);
    start();
  }


})();

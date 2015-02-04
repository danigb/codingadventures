(function() {
  "use strict";

  function createLogistic(c) {
    return function(prev) {
      return c * prev * (1 - prev);
    }
  }

  function skip(steps, logistic, initial) {
    var value = initial;
    for (var i = 0; i < 50; i++) {
      value = logistic(value);
    }
    return value;
  }

  function linear(srcScaleMin, srcScaleMax, destScaleMin, destScaleMax) {
    var factor = (destScaleMax - destScaleMin) / (srcScaleMax - srcScaleMin);
    return function(value) {
      return (value - srcScaleMin) * factor + destScaleMin;
    }
  }

  var xToC = linear(0, 600, 3.5, 4.0);

  var initial = 0.1;
  var x = 0;

  var y, c, logistic, value, hue;
  function initData() {
    y = 0;
    c = xToC(x);
    logistic = createLogistic(c);
    value = skip(50, logistic, initial);
    hue = 160;
  }
  initData();

  function iterate() {
    y++;
    if (y == 400) {
      x++;
      initData();
    } else {
      hue = (hue + 1) % 360;
      value = logistic(value);
    }
  }

  var speed = 400;
  var ctx = null;
  function animate() {
    for (var i = 0; i < speed; i++) {
      ctx.fillStyle = "hsl(" + hue + ", 80%, 50%)";
      ctx.fillRect(x, (1 - value) * 400, 1, 1);
      iterate();
    }
    if (running) {
      requestAnimationFrame(animate);
    }
  }

  var running = false;
  function toggleAnimate() {
    running = !running;
    if (running) {
      requestAnimationFrame(animate);
    }
  }

  window.onload = function() {
    var canvas = document.getElementById('logistic');
    ctx = canvas.getContext("2d");
    canvas.onclick = toggleAnimate;
    toggleAnimate();
  }
})();

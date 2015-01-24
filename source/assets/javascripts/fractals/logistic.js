(function() {
  'use strict';

  function logisticFunction(c, prev) {
    return c * prev * (1 - prev);
  }

  function point(ctx, x, y) {
    ctx.fillRect(x,y,1,1);
  }

  function linearProjection(srcScaleMin, srcScaleMax, destScaleMin, destScaleMax) {
    var factor = (destScaleMax - destScaleMin) / (srcScaleMax - srcScaleMin);
    return function(value) {
      return (value - srcScaleMin) * factor + destScaleMin;
    }
  }

  function drawLogisticFunction(canvas, opts) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#efefef";
    ctx.fillRect(0, 0, opts.width, opts.height);
    ctx.fillStyle = "#333";

    var iters = opts.height + opts.skip;
    var widthToC = linearProjection(0, opts.width, opts.minC, opts.maxC);

    for(var x = 0; x < opts.width; x++) {
      var c = widthToC(x)
      var val = opts.initial;
      for (var i = 0; i < iters; i++) {
        val = logisticFunction(c, val)
        if (i > opts.skip) {
          point(ctx, x, opts.height - (val * opts.height));
        }
      }
    }
  }

  window.onload = function() {
    var logistic = document.getElementById("logistic");
    if (logistic) {
      var options = { width: 600, height: 400, initial: 0.1, minC: 3.5, maxC: 4.05, skip: 50}
      drawLogisticFunction(logistic, options);
    }
  }
})();

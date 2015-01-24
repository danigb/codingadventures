(function() {
  'use strict';

  function logisticFunction(C, prev) {
    return C * (prev * (1 - prev));
  }

  function point(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, 1 * Math.PI, true);
    ctx.fill();
  }

  function drawLogisticFunction(opts, canvas) {
    console.log(canvas);
    var ctx = canvas.getContext("2d");
    var x = 0;
    for(var c = opts.minC; c <= opts.maxC; c += 2.0/opts.steps) {
      x = opts.initial;
      for (var i = 0; i < opts.iters; i++) {
        x = c * x * (1 - x);
        if (i > opts.skip) {
          point(ctx, ((c - opts.minC) * 300), 400 - (x * 400));
        }
      }
    }
  }

  $(function() {
    $("#logistic").each(function() {
      var options = { initial: 0.75, minC: 2, maxC: 4, steps: 600, iters: 300, skip: 50}
      drawLogisticFunction(options, this);
    });
  });
})();

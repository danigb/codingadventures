(function() {
  'use strict';

  function stream(source, scheduler) {
    scheduler = scheduler || stream.scheduler;
    var s = { source : source };

    s.subscribe = function(callback) {
      scheduler(callback, source);
      return s;
    }

    s.map = function(transform) {
      return stream(function*() {
        for(var v of source()) { yield transform(v) };
      }, scheduler);
    }
    s.skip = function(skip) {
      return stream(function*() {
        var s = skip;
        for (var v of source()) {
          if(s == 0)  yield v;
          else        s--;
        }
      }, scheduler);
    }
    s.take = function(count) {
      return stream(function*() {
        var c = -1;
        for (var v of source()) {
          c++;
          if (c < count) { yield v; }
          else break;
        }
      }, scheduler);
    }
    s.flatMap = function() {
      return stream(function*() {
        console.log("flatmap");
        var f = 0;
        for (var stream of source()) {
          console.log('FFFF', ++f);
          yield *stream.source();
        }
      }, scheduler);
    }
    return s;
  }
  stream.range = function(min, max, scheduler) {
    return stream(function*() {
      for(var i = min; i < max; i++) { yield i; }
    }, scheduler);
  }

  stream.scheduler = function(callback, source) {
    for(var v of source()) callback(v);
  }
  stream.scheduler.animationFrame = function(callback, source) {
    var generator = source();
    var next = generator.next();
    var frame = 0;
    function loop() {
      if(!next.done) {
        callback(next.value);
        next = generator.next();
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);
  }

  const WIDTH = 600;
  const HEIGHT = 500;
  const INITIAL = 0.1;
  const MIN_C = 3.5;
  const MAX_C = 4.0;
  const SKIP = 50;

  const FACTOR = (MAX_C - MIN_C) / WIDTH;

  function main() {
    var canvas = document.getElementById('logistic');
    var ctx = canvas.getContext('2d');

    var initialValue = 0.1;

    function logisticGen(C, init) {
      return function*() {
        var v = init;
        while(true) {
          v = C * v * (1 - v);
          yield v;
        }
      }
    }

    function draw(pixel) {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    }

    var offsets = stream.range(0, WIDTH, stream.scheduler.animationFrame);
    var columns = offsets.map(function(xOffset) {
        var C = xOffset * FACTOR + MIN_C;
        var logistic = stream(logisticGen(C, 0.1))
        var points = logistic.map(function(v) {
          var x = xOffset;
          var y = HEIGHT * (1 - v);
          var color = "hsl(" + (360 * v) + ", 80%, 50%)"
          return { x, y, color }
        });
        var column = points.skip(50).take(30);
        return column;
      });
    columns.subscribe(function(column) {
      column.subscribe(draw);
    });
  }

  window.onload = main;

})();

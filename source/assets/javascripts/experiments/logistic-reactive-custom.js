(function() {
  'use strict';

  function stream(source, scheduler) {
    scheduler = scheduler || stream.scheduler;
    var s = {};

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

  function logisticGen(C, init) {
    return function*() {
      var v = init;
      while(true) {
        v = C * v * (1 - v);
        yield v;
      }
    }
  }

  const WIDTH = 600;
  const HEIGHT = 400;
  const INITIAL = 0.1;
  const MIN_C = 3.5;
  const MAX_C = 4.0;
  const SKIP = 50;

  const FACTOR = (MAX_C - MIN_C) / WIDTH;

  function main() {
    var canvas = document.getElementById('logistic');
    ctx = canvas.getContext('2d');

    var initialValue = 0.1;

    function draw(x, value) {
      ctx.fillRect(x, HEIGHT * (1 - value), 1, 1);
    }

    var offsets = stream.range(0, WIDTH, stream.scheduler.animationFrame);
    var logistics = offsets.map(function(xOffset) {
        var C = xOffset * FACTOR + MIN_C;
        var logistic = stream(logisticGen(C, 0.1)).skip(50).take(100);
        logistic.xOffset = xOffset;
        return logistic;
      });
    logistics.subscribe(function(logistic) {
      logistic.subscribe(function(value) {
        draw(logistic.xOffset, value);
      });
    });
  }


  function test() {
    stream(function*() {
      while(true) { yield 'a' }
    })
      .take(5)
      .subscribe(function(x) {
        console.log(x);
      });
  };

  window.onload = main;

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
  }

  var ctx;
  function draw(logistic) {
    logistic.stream.subscribe(function(value) {
      ctx.fillRect(logistic.xOffset, HEIGHT * (1 - value), 1, 1);
    });
  }


})();

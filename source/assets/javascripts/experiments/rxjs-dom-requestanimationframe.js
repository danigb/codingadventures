(function() {
  'use strict';

  var canvas, context, subscription;

  function init() {
    canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    context = canvas.getContext('2d');
    document.body.appendChild(canvas);
  }

  function animate() {
    subscription = Rx.Observable.generate(
      0,
      function(x) { return true; },
      function(x) { return x + 1; },
      function(x) { return x; }
    )
    .timestamp()
    .throttle(500)
    .subscribe(draw);
  }

  function draw(ts) {
    var time = ts.timestamp * 0.002;
    var x = Math.sin( time ) * 192 + 256;
    var y = Math.cos( time * 0.9 ) * 192 + 256;
    context.fillStyle = ts.value % 2 === 0 ? 'rgb(200,200,20)' : 'rgb(20,20,200)';
    context.beginPath();
    context.arc( x, y, 10, 0, Math.PI * 2, true );
    context.closePath();
    context.fill();
  }

  window.onload = function() {
    init();
    animate();
  }
})();

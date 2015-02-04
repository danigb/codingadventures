(function() {
  'use strict';


  var x, y, z, dx, dy, dz, xx, yy;
  x = y = z = 1;
  function iterate(data) {
    dx = data.a * (y - x);
    dy = x * (data.b - z) - y;
    dz = x * y - data.c * z;
    x += dx * data.dt;
    y += dy * data.dt;
    z += dz * data.dt;
    xx = x * 16 + 300;
    yy = z * 16;
  }


  function drawLorentz(canvas, data, opts) {
    var ctx = canvas.getContext("2d");
    var running = true;
    var hue = 100;

    var speed = 2000;
    function animate() {
      for (var i = 0; i < speed; i++) {
        if (i % 200 == 0) {
          hue = (hue + 1) % 360;
        }
        ctx.fillStyle = "hsl(" + hue + ", 50%, 50%)";
        iterate(data);
        ctx.fillRect(x * 16 + 300, 450 - z * 16, 1, 1);
      }
      if (running) {
        requestAnimationFrame(animate);
      }
    };

    canvas.onclick = function() {
      if (running) {
        running = false;
      } else {
        running = true;
        requestAnimationFrame(animate);
      }
    }
    animate();
  }

  window.onload = function() {
    var canvas = document.getElementById('lorentz');
    if (canvas) {
      drawLorentz(canvas, {a: 12, b: 17, c: 1, dt: 0.001}, {width: 600, height: 400});
    }
  }
})();

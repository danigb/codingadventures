(function() {
  'use strict';

  var $time, $seq;
  var ROWS = 100;
  var STEPS = 16;
  var $rows;

  function prepare(parent, ROWS, STEPS) {
    var rows;

    rows = [];
    for (var r = 0; r < ROWS; r++) {
      var row = document.createElement('div');
      row.className = 'row'
      var steps = []
      rows.push(steps);
      for (var s = 0; s < STEPS; s++) {
        var step = document.createElement('div')
        steps.push(step);
        row.appendChild(step);
      }
      parent.appendChild(row);
    }
    return rows;
  }

  var lastTick = +new Date();
  var tick = 0;
  function animate() {
    var now = +new Date();
    $time.innerHTML = "FPS: " + parseInt(1000 / (now - lastTick));
    lastTick = now;

    tick++;
    for (var r = 0; r < ROWS; r++) {
      for (var s = 0; s < STEPS; s++) {
        $rows[r][s].className = isActive(tick, r, s) ? 'active' : 'inactive';
      }
    }

    requestAnimationFrame(animate);
  }

  function isActive(tick, row, step) {
    return (tick % 2) === (step % 2);
  }

  window.onload = function() {
    $seq = document.getElementById('sequence');
    $rows = prepare($seq, ROWS, STEPS);
    $time = document.getElementById('time');
    animate();
  }
})();

(function() {
  const ROWS = 100;
  const STEPS = 16;

  var $seq, $time;
  var h = virtualDom.h;
  var tick = 0;

  function newModel(tick) {
    var rows = [];
    for (r = 0; r < ROWS; r++) {
      var row = [];
      rows.push(row);
      for (s = 0; s < STEPS; s++) {
        row.push((tick % 2) === (s % 2));
      }
    }
    return rows;
  }

  function render(rows) {
    var createStep = function(step) {
      return h(step ? 'div.active' : 'div');
    }
    var createRow = function(row) {
      return h('div.row', row.map(createStep));
    }
    return h('div', rows.map(createRow));
  }

  var rootNode;
  var currentTree;
  var lastTick = +new Date();
  function animate() {
    tick++;
    var now = +new Date();
    $time.innerHTML = "FPS: " + parseInt(1000 / (now - lastTick));
    lastTick = now;

    var newTree = render(newModel(tick));
    var patches = virtualDom.diff(currentTree, newTree);
    rootNode = virtualDom.patch(rootNode, patches);
    currentTree = newTree;
    requestAnimationFrame(animate);
  }

  window.onload = function() {
    $time = document.getElementById('time');
    $seq = document.getElementById('sequence');
    currentTree = render(newModel(tick));
    rootNode = virtualDom.create(currentTree);
    $seq.appendChild(rootNode);
    requestAnimationFrame(animate);
  }
})();

(function() {
  const ROWS = 100;
  const STEPS = 16;
  var $time, $seq;

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

  var lastTick = +new Date();
  var tick = 0;
  function animate() {
    tick++;
    var now = +new Date();
    $time.innerHTML = "FPS: " + parseInt(1000 / (now - lastTick));
    lastTick = now;

    var model = newModel(tick);
    React.render(SequenceComponent({rows: model}), $seq);

    requestAnimationFrame(animate);
  }

  var R = React.createElement;
  var SequenceComponent = React.createFactory(React.createClass({
    render: function() {
      var createStep = function(step) {
        var cName = step ? 'active' : ''
        return R("div", {className: cName}, '');
      }

      var createRow = function(row) {
        return R("div", {className: 'row'}, row.map(createStep));
      }

      return R("div", null, this.props.rows.map(createRow));
    }
  }));

  window.onload = function() {
    $time = document.getElementById('time');
    $seq = document.getElementById('sequence');
    animate();
  }
})();

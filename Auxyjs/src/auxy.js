'use strict';

var song = {
  parts: { drums: 0, bass: 1, pad: 2, lead: 3},
  patterns: []
};

var app = {
  tempo: 100,
  song: song,
  playing: false,
  canvas: null,
  ctx: null,
  sizes: { pattern: { border: 2, height: 32 } },
  arr: { parts: 4, patterns: 8}
}


// Application
// -----------
function init(app) {
  app.canvas = document.getElementById("auxy");
  app.canvas.addEventListener('click', function(e) {
    console.log("click", e);
  });
  app.ctx = app.canvas.getContext('2d');
  resize(app);
}

function resize(app) {
  app.sizes.width = app.canvas.width;
  app.sizes.height = app.canvas.height;
  app.sizes.pattern.width = Math.floor(app.sizes.width / 4);
  console.log(app);
  redraw(app);
}

// Draw
// ----
function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPattern(app, partIdx, patternIdx) {
  app.ctx.fillStyle = '#555';
  var x = partIdx * app.sizes.pattern.width;
  var y = patternIdx * app.sizes.pattern.height + 2;
  app.ctx.fillRect(x, y, app.sizes.pattern.width - 2, app.sizes.pattern.height - 2);
}

function redraw(app) {
  app.ctx.fillStyle = '#333';
  app.ctx.fillRect(0, 0, app.sizes.width, app.sizes.height);
  app.ctx.strokeStyle = 'white';

  app.ctx.fillStyle = '#555';
  for(var c = 0; c < app.arr.parts; c++) {
    for (var i = 0; i < app.arr.patterns; i++) {
      drawPattern(app, c, i);
    }
  }
}

window.addEventListener('load', function() { init(app); });
window.addEventListener('resize', function() { resize(app); });

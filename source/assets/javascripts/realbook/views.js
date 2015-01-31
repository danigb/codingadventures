(function(realbook) {
  var h = virtualDom.h;

  function render(song, $parent) {
    function renderMeasure(measure) {
      var element = measure.selected ? 'div.measure.selected' : 'div.measure';
      return h(element, {
        onclick: function() {
          measure.selected = true;
          measure.trigger('changed');
        }
      }, [h("a", measure.chords)]);
    }

    function renderPart(partName) {
      var part = song.part(partName);
      return h("div.part", part.measures.map(renderMeasure));
    }

    function renderSheet(song) {
      return h("div.sheet", song.structure.map(renderPart));
    }

    function renderInfo(song) {
      var time = song.time();
      return [
        h("h2", song.title()),
        h("div.info", [
          h("span.bpm", "" + song.tempo() + "bpm /"),
          h("span.structure", " " + song.structure.join('') + " /"),
          h("span.measures", " " + song.length() + " measures /"),
          h("span.time", " " + time.m + ":" + time.s)
        ])
      ];
    }

    function renderSelect(song) {
      return h("div.select", "Select: " + song.select().type)
    }

    function renderSong(song) {
      return h("div.song", [renderInfo(song), renderSelect(song), renderSheet(song)]);
    }


    var currentTree = renderSong(song);
    var rootNode = virtualDom.create(currentTree);
    $parent.appendChild(rootNode);

    song.on('changed', function() {
      console.log("render selected", song.selected);
      var newTree = renderSong(song);
      var patches = virtualDom.diff(currentTree, newTree);
      rootNode = virtualDom.patch(rootNode, patches);
      currentTree = newTree;
    });
  }

  realbook.render = render;
})(window.realbook);

(function() {
  'use strict';

  /******* MODEL ***********/
  function song(title, structure) {
    var song = { title: title };

    song.structure = structure.split('');
    song.parts = {};
    var _measures = null;

    function createMeasure(number, partName, data, prev) {
      var chords = data.trim() == '%' ?
        prev.chords : data.split(' ');
      return {
        number: number,
        partName: partName,
        chords: chords
      };
    }

    function createMeasures() {
      var number = 0;
      var prev = null;
      var measures = [];
      var current = null;
      for(var partName of song.structure) {
        for(var data of song.parts[partName]) {
          current = createMeasure(number, partName, data, prev);
          measures.push(current);
          number++;
          prev = current;
        }
      }
      return measures;
    }

    song.part = function(name, measures) {
      song.parts[name] = measures.split('|');
      _measures = null;
      return song;
    }

    song.measures = function() {
      if (_measures == null) {
        _measures = createMeasures();
      }
      return _measures;
    }

    return song;
  }

  /********** VIEW **************/
  var h = React.createElement;
  var Component = function(c) {
    return React.createFactory(React.createClass(c));
  }
  var cx = React.addons.classSet;

  var MeasureComponent = Component({
    getInitialState: function() {
      return { selected: false };
    },
    handleClick: function() {
      this.setState({selected: true});
      this.props.onSelected(this);
    },
    render: function() {
      var classes = cx({
        'measure': true,
        'selected': this.state.selected
      });
      var state = this.state;
      var label = this.props.measure.chords.join(' ');
      return h('div', {
        className: classes,
        onClick: this.handleClick },
        label);
    }
  });

  var SheetComponent = Component({
    render: function() {
      var song = this.props.song;
      var handler = this.props.onSelected;

      function renderMeasure(measure) {
        return MeasureComponent({
          measure: measure,
          onSelected: handler
        });
      }

      return h('div', { className: 'sheet'},
        song.measures().map(renderMeasure));
    }
  });

  var MeasureInfoComponent = Component({
    render: function() {
      function renderChord(chord) {
        return h('div', {}, chord);
      }
      var m = this.props.measure;
      return h('div', { className: 'measure-info' },
        h('h3', {}, "#" + (m.number + 1)),
        h('div', {}, m.chords.map(renderChord)));
    }
  });

  var SongComponent = Component({
    getInitialState: function() {
      return { currentSelection: null };
    },
    handleMeasureSelected: function(measure) {
      if (this.state.currentSelection != null) {
        this.state.currentSelection.setState({selected: false});
      }
      this.setState({currentSelection: measure});
    },
    render: function() {
      var info = this.state.currentSelection == null ?
        h('h4', {className: 'measure-info'}, "Select a measure") :
        MeasureInfoComponent({ measure: this.state.currentSelection.props.measure});

      return h('div', { className: 'song'},
        SheetComponent({
          song: this.props.song,
          onSelected: this.handleMeasureSelected
        }), info);

    }
  });

  function render(song, element) {
    React.render(SongComponent({song: song}), element);
  }

  window.onload = function() {
    var $songs = document.getElementById('songs');
    var s = song("All of me", "AB")
      .part("A", "Cmaj7|%|E7|%|A7|%|Dm|%|E7|%|Am|%|D7|%|Dm7|G7")
      .part("B", "Cmaj7|%|E7|%|A7|%|Dm|%|F|Fm|Cmaj7 Em7|A7|Dm7|G7|C6|%");

    render(s, $songs);
  }
})();

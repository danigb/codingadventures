(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BeatboxComponent, Pattern, name, pattern, sampler, _i, _len, _ref;

Pattern = require('./models/pattern.js');

BeatboxComponent = React.createFactory(require('./components/beatbox.react.js'));

pattern = new Pattern(110, 16);

_ref = ['ohat', 'hhat', 'snare', 'kick'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  name = _ref[_i];
  pattern.addSequence(name);
}

React.render(BeatboxComponent({
  pattern: pattern
}), document.getElementById('beatbox'));

sampler = require('./audio/sampler.js');

sampler.playSample('../sounds/maeclave.wav');



},{"./audio/sampler.js":2,"./components/beatbox.react.js":3,"./models/pattern.js":7}],2:[function(require,module,exports){
var context, loadSample, playBuffer, playSample;

context = window.webkitAudioContext ? new webkitAudioContext() : new AudioContext();

loadSample = function(url, callback) {
  var request;
  request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    return context.decodeAudioData(request.response, callback, function(error) {
      return console.error('decodeAudioData error', error);
    });
  };
  request.onerror = function() {
    return console.error('BufferLoader: XHR error');
  };
  return request.send();
};

playBuffer = function(buffer) {
  var source;
  source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  return source.start(0);
};

playSample = function(url) {
  return loadSample(url, function(buffer) {
    return playBuffer(buffer);
  });
};

module.exports = {
  playSample: playSample
};



},{}],3:[function(require,module,exports){
var BeatboxComponent, Pattern, Transport, div;

Pattern = React.createFactory(require('./pattern.react.js'));

Transport = React.createFactory(require('./transport.react.js'));

div = React.DOM.div;

BeatboxComponent = React.createClass({
  render: function() {
    return div({
      className: 'beatbox'
    }, Transport({
      pattern: this.props.pattern
    }), Pattern({
      pattern: this.props.pattern
    }));
  }
});

module.exports = BeatboxComponent;



},{"./pattern.react.js":4,"./transport.react.js":6}],4:[function(require,module,exports){
var PatternComponent, Sequence, div;

Sequence = React.createFactory(require('./sequence.react.js'));

div = React.DOM.div;

PatternComponent = React.createClass({
  render: function() {
    var pattern, sequence;
    pattern = this.props.pattern;
    return div({
      className: 'beatbox-pattern'
    }, (function() {
      var _i, _len, _ref, _results;
      _ref = pattern.sequences;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sequence = _ref[_i];
        _results.push(Sequence({
          sequence: sequence
        }));
      }
      return _results;
    })());
  }
});

module.exports = PatternComponent;



},{"./sequence.react.js":5}],5:[function(require,module,exports){
var SequenceComponent, a, div, _ref;

_ref = React.DOM, div = _ref.div, a = _ref.a;

SequenceComponent = React.createClass({
  handleStepClick: function(e) {
    var step, stepNum;
    stepNum = e.target.text;
    step = this.props.sequence.steps[stepNum - 1];
    step.mute = !step.mute;
    return this.forceUpdate();
  },
  render: function() {
    var sequence, step;
    sequence = this.props.sequence;
    return div({
      className: 'beatbox-sequence'
    }, a({
      className: 'name',
      href: '#'
    }, sequence.name), div({
      className: 'steps'
    }, (function() {
      var _i, _len, _ref1, _results;
      _ref1 = sequence.steps;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        step = _ref1[_i];
        _results.push(this._buildStep(sequence.name, step));
      }
      return _results;
    }).call(this)));
  },
  _buildStep: function(name, step) {
    var muteState;
    muteState = "mute" + (step.mute ? 'On' : 'Off');
    return a({
      className: "step " + muteState,
      href: '#',
      onClick: this.handleStepClick
    }, step.num);
  }
});

module.exports = SequenceComponent;



},{}],6:[function(require,module,exports){
var TransportComponent, button, div, input, label, _ref;

_ref = React.DOM, div = _ref.div, input = _ref.input, button = _ref.button, label = _ref.label;

TransportComponent = React.createClass({
  handleTempoChange: function(e) {
    var nextTempo;
    nextTempo = e.target.value;
    this.props.pattern.tempo = nextTempo;
    return this.forceUpdate();
  },
  handlePlay: function() {
    return console.log("Play");
  },
  handleStop: function() {
    return console.log("Stop");
  },
  render: function() {
    return div({
      className: 'beatbox-transport'
    }, button({
      onClick: this.handlePlay
    }, 'Play'), button({
      onClick: this.handleStop
    }, 'Stop'), label(null, "Tempo: " + this.props.pattern.tempo), input({
      type: 'range',
      step: 1,
      min: 30.0,
      max: 160,
      onChange: this.handleTempoChange
    }, {
      value: this.props.pattern.tempo
    }));
  }
});

module.exports = TransportComponent;



},{}],7:[function(require,module,exports){
var Pattern, Sequence;

Sequence = require('./sequence.js');

Pattern = (function() {
  function Pattern(tempo, length) {
    this.tempo = tempo;
    this.length = length;
    this.sequences = [];
  }

  Pattern.prototype.addSequence = function(name) {
    return this.sequences.push(new Sequence(name, this.length));
  };

  return Pattern;

})();

module.exports = Pattern;



},{"./sequence.js":8}],8:[function(require,module,exports){
var Sequence;

Sequence = (function() {
  function Sequence(name, stepCount) {
    var step;
    this.name = name;
    this.stepCount = stepCount;
    this.steps = (function() {
      var _i, _ref, _results;
      _results = [];
      for (step = _i = 1, _ref = this.stepCount; 1 <= _ref ? _i <= _ref : _i >= _ref; step = 1 <= _ref ? ++_i : --_i) {
        _results.push({
          num: step,
          mute: true
        });
      }
      return _results;
    }).call(this);
  }

  return Sequence;

})();

module.exports = Sequence;



},{}]},{},[1])
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Pattern, PatternComponent, name, pattern, _i, _len, _ref;

Pattern = require('./models/pattern.js');

PatternComponent = React.createFactory(require('./components/pattern.react.js'));

pattern = new Pattern('beatbox', 16);

_ref = ['ohat', 'hhat', 'snare', 'kick'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  name = _ref[_i];
  pattern.addSequence(name);
}

React.render(PatternComponent({
  pattern: pattern
}), document.getElementById('beatbox'));



},{"./components/pattern.react.js":2,"./models/pattern.js":4}],2:[function(require,module,exports){
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



},{"./sequence.react.js":3}],3:[function(require,module,exports){
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



},{}],4:[function(require,module,exports){
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



},{"./sequence.js":5}],5:[function(require,module,exports){
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
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Pattern, Transport, pattern;

Pattern = require('./models/pattern.js');

Transport = React.createFactory(require('./components/transport.react.js'));

pattern = new Pattern(120);

React.render(Transport({
  pattern: pattern
}), document.getElementById('beatbox'));



},{"./components/transport.react.js":2,"./models/pattern.js":3}],2:[function(require,module,exports){
var TransportComponent, button, div, input, label, _ref;

_ref = React.DOM, div = _ref.div, input = _ref.input, button = _ref.button, label = _ref.label;

TransportComponent = React.createClass({
  handleTempoChange: function() {
    var nextTempo;
    nextTempo = this.refs.tempoRange.getDOMNode().value;
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
    }, 'Stop'), label({}, "Tempo: " + this.props.pattern.tempo), input({
      type: 'range',
      step: 1,
      min: 30.0,
      max: 160,
      ref: 'tempoRange',
      onChange: this.handleTempoChange,
      value: this.props.pattern.tempo
    }));
  }
});

module.exports = TransportComponent;



},{}],3:[function(require,module,exports){
var Pattern;

Pattern = (function() {
  function Pattern() {}

  Pattern.prototype.tempo = 123;

  return Pattern;

})();

module.exports = Pattern;



},{}]},{},[1])
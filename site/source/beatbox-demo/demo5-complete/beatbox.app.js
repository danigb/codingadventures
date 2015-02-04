(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BeatboxComponent, Pattern, Sampler, Scheduler, addClass, context, highlightColumn, name, pattern, removeClass, sampler, scheduler, _i, _len, _ref;

context = window.webkitAudioContext ? new webkitAudioContext() : new AudioContext();

Sampler = require('./audio/sampler.js');

sampler = new Sampler(context);

sampler.loadInstrument('Maestro Rhythm King MRK-2', {
  ohat: '/beatbox-demo/sounds/maehat2.wav',
  hhat: '/beatbox-demo/sounds/maehat1.wav',
  snare: '/beatbox-demo/sounds/maesnare.wav',
  kick: '/beatbox-demo/sounds/maekick.wav'
});

Pattern = require('./models/pattern.js');

pattern = new Pattern(16);

_ref = ['ohat', 'hhat', 'snare', 'kick'];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  name = _ref[_i];
  pattern.addSequence(name);
}

Scheduler = require('./audio/scheduler.js');

scheduler = new Scheduler(context, {
  tempo: 80
});

addClass = function(element, className) {
  return element.classList.add(className);
};

removeClass = function(element, className) {
  return element.classList.remove(className);
};

highlightColumn = function(stepIndex) {
  var el, prevStepIndex, _j, _k, _len1, _len2, _ref1, _ref2, _results;
  prevStepIndex = stepIndex === 0 ? pattern.length - 1 : stepIndex - 1;
  _ref1 = document.getElementsByClassName("step-" + stepIndex);
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    el = _ref1[_j];
    addClass(el, 'active');
  }
  _ref2 = document.getElementsByClassName("step-" + prevStepIndex);
  _results = [];
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    el = _ref2[_k];
    _results.push(removeClass(el, 'active'));
  }
  return _results;
};

scheduler.onPlay = function(beat, time) {
  var sequence, step, stepIndex, _j, _len1, _ref1, _results;
  stepIndex = beat % pattern.length;
  highlightColumn(stepIndex);
  _ref1 = pattern.sequences;
  _results = [];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    sequence = _ref1[_j];
    step = sequence.steps[stepIndex];
    if (step.mute === false) {
      _results.push(sampler.playSample(sequence.name, time));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

scheduler.onStop = function() {
  var el, _j, _len1, _ref1, _results;
  _ref1 = document.getElementsByClassName('step');
  _results = [];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    el = _ref1[_j];
    _results.push(removeClass(el, 'active'));
  }
  return _results;
};

BeatboxComponent = React.createFactory(require('./components/beatbox.react.js'));

React.render(BeatboxComponent({
  pattern: pattern,
  sampler: sampler,
  scheduler: scheduler
}), document.getElementById('beatbox'));



},{"./audio/sampler.js":2,"./audio/scheduler.js":3,"./components/beatbox.react.js":4,"./models/pattern.js":8}],2:[function(require,module,exports){
var Sampler, SamplerInstrument;

SamplerInstrument = (function() {
  function SamplerInstrument(context, name, samples) {
    var url;
    this.context = context;
    this.name = name;
    this.buffers = {};
    for (name in samples) {
      url = samples[name];
      this._loadSample(name, url);
    }
  }

  SamplerInstrument.prototype._loadSample = function(name, url) {
    var request;
    request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = (function(_this) {
      return function() {
        return _this.context.decodeAudioData(request.response, function(buffer) {
          return _this.buffers[name] = buffer;
        }, function(error) {
          return console.error('decodeAudioData error', error);
        });
      };
    })(this);
    request.onerror = function() {
      return console.error('BufferLoader: XHR error');
    };
    return request.send();
  };

  return SamplerInstrument;

})();

Sampler = (function() {
  function Sampler(context) {
    this.context = context;
  }

  Sampler.prototype.loadInstrument = function(name, samples) {
    return this.instrument = new SamplerInstrument(this.context, name, samples);
  };

  Sampler.prototype.playSample = function(name, time) {
    var buffer;
    time = time || 0;
    if (this.instrument) {
      buffer = this.instrument.buffers[name];
    }
    if (buffer) {
      return this._playBuffer(buffer, time);
    }
  };

  Sampler.prototype._playBuffer = function(buffer, time) {
    var source;
    source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    return source.start(time);
  };

  return Sampler;

})();

module.exports = Sampler;



},{}],3:[function(require,module,exports){
var Scheduler, scheduleThreshold, tickIntervalMs,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

scheduleThreshold = 0.1;

tickIntervalMs = 100;

Scheduler = (function() {
  function Scheduler(context, options) {
    this.context = context;
    this._tick = __bind(this._tick, this);
    this.subdivision = options.subdivision || 2;
    this.onStart = options.onStart ||  (function() {});
    this.onStop = options.onStop || (function() {});
    this.onPlay = options.player || (function() {});
    this._timerID = null;
    this.setTempo(options.tempo || 120);
  }

  Scheduler.prototype.setTempo = function(newTempo) {
    this.tempo = newTempo;
    return this._secondsPerBeat = 60.0 / (this.tempo * this.subdivision);
  };

  Scheduler.prototype.start = function() {
    if (this._timerID !== null) {
      return;
    }
    this.nextBeat = 0;
    this.nextBeatTime = this.context.currentTime;
    this._timerID = setInterval(this._tick, tickIntervalMs);
    return this.onStart();
  };

  Scheduler.prototype.stop = function() {
    if (!this._timerID) {
      return;
    }
    clearInterval(this._timerID);
    this._timerID = null;
    return this.onStop();
  };

  Scheduler.prototype._tick = function() {
    var _results;
    _results = [];
    while (this.nextBeatTime - this.context.currentTime < scheduleThreshold) {
      this.onPlay(this.nextBeat, this.nextBeatTime);
      this.nextBeat++;
      _results.push(this.nextBeatTime += this._secondsPerBeat);
    }
    return _results;
  };

  return Scheduler;

})();

module.exports = Scheduler;



},{}],4:[function(require,module,exports){
var BeatboxComponent, Pattern, Transport, div;

Pattern = React.createFactory(require('./pattern.react.js'));

Transport = React.createFactory(require('./transport.react.js'));

div = React.DOM.div;

BeatboxComponent = React.createClass({
  render: function() {
    return div({
      className: 'beatbox'
    }, Transport(this.props), Pattern(this.props));
  }
});

module.exports = BeatboxComponent;



},{"./pattern.react.js":5,"./transport.react.js":7}],5:[function(require,module,exports){
var PatternComponent, Sequence, div;

Sequence = React.createFactory(require('./sequence.react.js'));

div = React.DOM.div;

PatternComponent = React.createClass({
  handleNameClick: function(name) {
    return this.props.sampler.playSample(name);
  },
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
          sequence: sequence,
          onNameClick: this.handleNameClick
        }));
      }
      return _results;
    }).call(this));
  }
});

module.exports = PatternComponent;



},{"./sequence.react.js":6}],6:[function(require,module,exports){
var SequenceComponent, a, div, _ref;

_ref = React.DOM, div = _ref.div, a = _ref.a;

SequenceComponent = React.createClass({
  handleStepClick: function(e) {
    e.preventDefault();
    this.props.sequence.toggleStep(parseInt(e.target.text) - 1);
    return this.forceUpdate();
  },
  handleNameClick: function(e) {
    var sampleName;
    e.preventDefault();
    sampleName = e.target.text;
    return this.props.onNameClick(sampleName);
  },
  render: function() {
    var sequence, step;
    sequence = this.props.sequence;
    return div({
      className: 'beatbox-sequence'
    }, a({
      className: 'name',
      href: '#',
      onClick: this.handleNameClick
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
      className: "step step-" + step.num + " " + muteState,
      href: '#',
      onClick: this.handleStepClick
    }, step.num + 1);
  }
});

module.exports = SequenceComponent;



},{}],7:[function(require,module,exports){
var TransportComponent, button, div, input, label, _ref;

_ref = React.DOM, div = _ref.div, input = _ref.input, button = _ref.button, label = _ref.label;

TransportComponent = React.createClass({
  handleTempoChange: function(e) {
    var nextTempo;
    nextTempo = e.target.value;
    this.props.scheduler.setTempo(nextTempo);
    return this.forceUpdate();
  },
  handlePlay: function() {
    return this.props.scheduler.start();
  },
  handleStop: function() {
    return this.props.scheduler.stop();
  },
  render: function() {
    return div({
      className: 'beatbox-transport'
    }, button({
      onClick: this.handlePlay
    }, '▶ Play'), button({
      onClick: this.handleStop
    }, '■ Stop'), label(null, "Tempo: " + this.props.scheduler.tempo), input({
      type: 'range',
      step: 1,
      min: 30.0,
      max: 160,
      onChange: this.handleTempoChange,
      value: this.props.scheduler.tempo
    }));
  }
});

module.exports = TransportComponent;



},{}],8:[function(require,module,exports){
var Pattern, Sequence;

Sequence = require('./sequence.js');

Pattern = (function() {
  function Pattern(length) {
    this.length = length;
    this.sequences = [];
  }

  Pattern.prototype.addSequence = function(name) {
    return this.sequences.push(new Sequence(name, this.length));
  };

  return Pattern;

})();

module.exports = Pattern;



},{"./sequence.js":9}],9:[function(require,module,exports){
var Sequence;

Sequence = (function() {
  function Sequence(name, length) {
    var step;
    this.name = name;
    this.length = length;
    this.steps = (function() {
      var _i, _ref, _results;
      _results = [];
      for (step = _i = 0, _ref = this.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; step = 0 <= _ref ? ++_i : --_i) {
        _results.push({
          num: step,
          mute: true
        });
      }
      return _results;
    }).call(this);
  }

  Sequence.prototype.toggleStep = function(stepNum) {
    var step;
    this.stepNum = stepNum;
    step = this.steps[stepNum];
    return step.mute = !step.mute;
  };

  return Sequence;

})();

module.exports = Sequence;



},{}]},{},[1])
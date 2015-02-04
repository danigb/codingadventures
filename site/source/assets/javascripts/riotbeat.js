//= require vendor/zepto.min.js
//= require vendor/riot.js
//= require vendor/blip.js

(function() {
  'use strict';

  // MODELS: Pattern
  function Pattern(data) {
    var self = riot.observable(this);
    self.type = 'Pattern'

    self.length = data.length ? data.length : 16;
    self.names = [];
    self.sequences = {};

    for (var name in data) {
      self.names.push(name);
      self.sequences[name] = $.map(data[name].split(''), function(s, i) {
        return new Step({num: i, vol: parseInt(s), seq: name});
      });
      if (self.sequences[name].length != self.length) {
        throw riot.render("Sequence {name} length should be {expected} but was {actual}", {
          name: name,
          expected: self.length,
          actual: self.sequences[name].length
        })
      }
    };

    self.step = function(name, num) {
      return self.sequences[name][parseInt(num)];
    }
  }

  // MODELS: Step
  function Step(data) {
    var self = riot.observable(this);
    self.seq = data.seq;
    self.num = data.num;
    self.vol = data.vol ? data.vol : 0;
    self.playing = data.playing ? true : false;
    self.volInc = function() { self.vol = (self.vol + 1) % 3 }
  }

  // MODELS: Beatbox
  function BeatBox(data) {
    var STEPS_PER_BEAT = 2;

    var self = riot.observable(this);
    var tempo = data.tempo;
    self.pattern = data.pattern;
    self.metronome = null;

    blip.sampleLoader().samples(data.samples).done(function() {
      console.log("Samples loaded.");
    }).load();

    self.play = function() {
      if (self.metronome != null) return false;

      var count = 0;
      self.metronome = blip.loop().tempo(tempo * STEPS_PER_BEAT).tick(function(time) {
        for (name in self.pattern.sequences) {
          var step = self.pattern.step(name, count);
          if (step.vol > 0) {
            blip.clip().sample(name).play(time);
          }
        }
        self.trigger('tick', count, time)
        count = (count + 1) % self.pattern.length;
      });
      self.metronome.start();
      self.trigger('start');
      return true;
    }

    self.stop = function() {
      if (self.metronome == null) return false;
      self.metronome.stop();
      self.metronome = null;
      self.trigger('stop');
      return true;
    }

    self.tempo = function(newTempo) {
      if (!arguments.length) return tempo;
      tempo = newTempo;
      if (self.metronome) {
        self.metronome.tempo(newTempo * STEPS_PER_BEAT);
      }
    }
  }

  // PRESENTERS
  function PatternPresenter(element, options) {
    console.log(element, "ea");
    element = $(element);
    var beatbox = options.beatbox;
    var pattern = beatbox.pattern;

    var TMPL_SEQ = '<div class="sequence sequence-{name}"><a class="sample" href="#">{name}</a>{steps}</div>';
    function renderSequence(name) {
      return riot.render(TMPL_SEQ, {
        name: name,
        steps: $.map(pattern.sequences[name], renderStep).join('')
      });
    }

    var TMPL_STEP = '<a href="#" id="step-{seqName}-{num}" class="step step-{num} vol-{vol}" data-seq="{seqName}" data-num="{num}">{label}</a>'
    function renderStep(step) {
      return riot.render(TMPL_STEP, {
        vol: step.vol,
        num: step.num,
        label: step.num + 1,
        seqName: step.seq
      });
    }

    function getStepView(step) {
      return element.find("#step-" + step.seq + "-" + step.num);
    }

    element.append($.map(pattern.names, renderSequence).join(''));

    element.on('click', 'a.step', function() {
      var step = pattern.step($(this).data('seq'), $(this).data('num'));
      step.volInc();
      pattern.trigger('updated', step);
    }).on('click', 'a.sample', function() {
      blip.clip().sample($(this).text()).play(0);
    });

    pattern.on('updated', function(step) {
      getStepView(step).replaceWith(renderStep(step));
    });

    beatbox.on('tick', function(step) {
      var prevStep = step == 0 ? pattern.length - 1 : step - 1;
      element.find('.step-' + prevStep).removeClass('active');
      element.find('.step-' + step).addClass('active');
    });
    beatbox.on('stop', function() {
      element.find('.step').removeClass('active');
    })
    return element;
  }

  function BeatboxPresenter(element, options) {
    element = $(element);
    var beatbox = options.beatbox;

    PatternPresenter($('#riotbeat .pattern'), { beatbox: beatbox });
    element.find('.tempo').val(beatbox.tempo());

    element.on('click', '.play', beatbox.play);
    element.on('click', '.stop', beatbox.stop);
    element.on('change', '.tempo', function() {
      var newTempo = parseInt($(this).val());
      if (newTempo) {
        beatbox.tempo(newTempo);
      }
    });
  }

  var beatbox = new BeatBox({
    tempo: 120,
    samples: {
      clave:  '/assets/sounds/maeclave.wav',
      hhat:   '/assets/sounds/maehat1.wav',
      snare:  '/assets/sounds/maesnare.wav',
      kick:   '/assets/sounds/maekick.wav'
    },
    pattern: new Pattern({
      clave:  '2.1.1.1.2.1.1.1.',
      hhat:   '0.1.0.1.0.1.0.1.',
      snare:  '0.0.2.0.0.0.1.0.',
      kick:   '2.0.0.0.1.0.0.0.'
    })
  });


  BeatboxPresenter($('#riotbeat .transport'), { beatbox: beatbox });


})();

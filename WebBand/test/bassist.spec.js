
var Sequence = require('../src/sequence.js');
var Bassist = require('../src/bassist.js');

describe('Bassist', function() {
  describe('chord roots', function() {
    it('play the chord roots', function() {
      var chords = new Sequence('C Dm7');
      var roots = Bassist.roots(chords, {duration: 1});
      expect(roots.toString()).toEqual('[0:1]c4 [1:1]d4');
    });

    it('play quarter notes by default', function() {
      var chords = new Sequence('C G');
      var roots = Bassist.roots(chords);
      expect(roots.toString()).toEqual(
        '[0:0.25]c4 [0.25:0.25]c4 [0.5:0.25]c4 [0.75:0.25]c4 ' +
        '[1:0.25]g4 [1.25:0.25]g4 [1.5:0.25]g4 [1.75:0.25]g4')
    });
  });
});

var sheet = require('../../app/structure/sheet.js');

var allOfMe = sheet("All of me").part("chords",
  { A: "Cmaj7|%|E7|%|A7|%|Dm|%|E7|%|Am|%|D7|%|Dm7|G7",
    B: "Cmaj7|%|E7|%|A7|%|Dm|%|F|Fm|Cmaj7 Em7|A7|Dm7|G7|C6|%" });

describe('sheet', function() {
  describe('create', function() {
    it('should have name', function() {
      expect(allOfMe.name).toEqual("All of me");
    });
  });

  describe('part', function() {
    it('should return a part by name', function() {
      var part = allOfMe.part('chords');
      expect(part).toBeDefined();
    });
    it('each section is a pattern', function() {
      var part = allOfMe.part('chords');
      expect(part['A'].length).toBe(16);
    });
  });

  describe('sections', function() {
    it('should return section names of a part', function() {
      expect(allOfMe.sections('chords').join('')).toEqual('AB');
    });
  });

  describe('flattern', function() {
    var s = sheet('Song').part("chords", {A: "A", B: "B"});
  });
});

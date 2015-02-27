'use strict';

var Sequence = require('../src/sequence.js');
var parse = Sequence.parse;


describe('Sequence', function() {
  describe('build a sequence', function() {
    it('list items has same duration', function() {
      var seq = new Sequence('a b');
      expect(seq.toString()).toEqual("[0:1]a [1:1]b");
    });

    it('one level subtree', function() {
      var seq = new Sequence('a (b c)');
      expect(seq.toString()).toEqual("[0:1]a [1:0.5]b [1.5:0.5]c");
    });

    it('two level subtree', function() {
      var seq = new Sequence('a (b (c d))');
      expect(seq.toString()).toEqual("[0:1]a [1:0.5]b [1.5:0.25]c [1.75:0.25]d");
    });
  });

  describe('parse', function() {
    it('should parse a list of items', function() {
      expect(parse("a b")).toEqual(['a', 'b']);
    });

    it("should treat | as spaces", function() {
      expect(parse("a|b")).toEqual(['a','b']);
    });

    it("should treat , as spaces", function() {
      expect(parse("a,b")).toEqual(['a','b']);
    });

    it('should parse empty sublist', function() {
      expect(parse("()")).toEqual([]);
    });

    it("should treat [] as parenthesis", function() {
      expect(parse("[a,b]")).toEqual(['a', 'b']);
    });

    it("should treat {} as parenthesis", function() {
      expect(parse("{a|b}")).toEqual(['a', 'b']);
    });

    it('should parse sublist with items', function() {
      expect(parse("(hi you)")).toEqual(["hi", "you"]);
    });

    it('should parse sublists with list as items', function() {
      expect(parse("((x))")).toEqual(["x"]);
    });

    it('should parse list compositions', function() {
      expect(parse("x (a b)")).toEqual(["x", ["a", "b"]]);
    });

    it('should parse list compositions', function() {
      expect(parse("x (y) z")).toEqual(["x", ["y"], "z"]);
    });

    it('should parse list compositions', function() {
      expect(parse("x (y) (a b c)")).toEqual(["x", ["y"], ["a", "b", "c"]]);
    });
  });
});

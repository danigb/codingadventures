'use strict';

var parse = require('../../app/structure/parse.js');

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
    expect(parse("()")).toEqual([[]]);
  });

  it("should treat [] as parenthesis", function() {
    expect(parse("[a,b]")).toEqual([['a', 'b']]);
  });

  it("should treat {} as parenthesis", function() {
    expect(parse("{a|b}")).toEqual([['a', 'b']]);
  });

  it('should parse sublist with items', function() {
    expect(parse("(hi you)")).toEqual([["hi", "you"]]);
  });

  it('should parse sublists with list as items', function() {
    expect(parse("((x))")).toEqual([[["x"]]]);
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

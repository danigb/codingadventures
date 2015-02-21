'use strict';

var parse = require('../../app/structure/parse.js');
var pattern = require('../../app/structure/pattern.js');

function tokens(ptn) {
  return ptn.map(function(e) { return e.token }).join(',')
}
function durations(ptn) {
  return ptn.map(function(e) { return e.duration }).join(',')
}

describe('ptn', function() {
  xit('list items has same duration', function() {
    var ptn = pattern('a b');
    expect(tokens(ptn)).toEqual('a,b');
    expect(durations(ptn)).toEqual('1,1');
  });

  it('one level subtree', function() {
    var ptn = pattern('a (b c)');
    expect(tokens(ptn)).toEqual('a,b,c');
    expect(durations(ptn)).toEqual('1,0.5,0.5');
  });

  it('two level subtree', function() {
    var ptn = pattern('a (b (c d))');
    expect(tokens(ptn)).toEqual('a,b,c,d');
    expect(durations(ptn)).toEqual('1,0.5,0.25,0.25');
  })
});

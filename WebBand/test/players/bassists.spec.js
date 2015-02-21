'use strict';

var pattern = require('../../app/structure/pattern.js');
var bassists = require('../../app/players/bassists.js');

describe("Bass players", function() {
  describe("Root notes bassist", function() {
    it('create sequences', function() {
      var seq = bassists.rootNotePlayer(pattern('Cmaj7'), { duration: 0.25} );
      expect(seq.eventsCount()).toEqual(8);
    })
  });
});

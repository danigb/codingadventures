var notePlayer = require('../../app/players/note_player.js');

describe("Note player", function() {
  it("add notes to sequence", function() {
    var seq = notePlayer('(c2 d2 e2 f2)');
    expect(seq.eventsCount()).toEqual(8);
  });
});

var treo = require('treo');

module.exports = function(tracks) {
  function albums(tracks) {
    var index = {}
    return tracks.filter(track) {
      if (!index[track.title]) {
        index[track.title] = {
          title: track.album
        };
      }
    }
  }
  var schema = treo.schema()
    .version(1)
      .addStore('albums', { key: 'title' })
    .version(2)
      .addStore('artists', { key: 'name' });

  var db = treo('music', schema);

  db.albums = db.store('albums');
  db.albums.batch(tracks.map(function(track) {
    var album = { title: track.album };
    album.artist = track.artist;
    album.year = track.year;
    album.tracks = [ track ];
    album.heard = 0;
    album.max_play_count = 0;

    if (track.play_count) {
      album.heard++;
      album.max_play_count = Math.max(album.max_play_count, track.play_count);
    }
    return album;
  }));

}

module.exports = function(tracks) {
  var db = function() {};

  function table(table) {
    table.models = [];
    table.index = {};

    table.add = function(key, data) {
      var model = table.index[key];
      if (model == null) {
        model = table.create(data)
        table.onCreate(data, model);
        table.models.push(model);
        table.index[key] = model;
      }
      return model;
    }

    return table;
  }

  db.albums = table({
    create: function(track) {
      var album = { title: track.album };
      album.artist = track.artist;
      album.year = track.year;
      album.tracks = [ track ];
      album.heard = 0;
      album.max_play_count = 0;
      return album;
    },
    onCreate: function(track, album) {
      if (track.play_count) {
        album.heard++;
        album.max_play_count = Math.max(album.max_play_count, track.play_count);
      }
    }
  });

  db.artists = table({

  });


  tracks.forEach(function(track) {
    var album = db.albums.add(track.title, track);
    var artists = db.artists.add(track.artist, track);
  });

  db.albums.models.sort(function(a, b) {
    return b.max_play_count - a.max_play_count;
  });

  return db;
}

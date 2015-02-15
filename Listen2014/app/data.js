'use strict';

var tracks = require('./tracks2014.json');
var store = require('./store.js');

function buildData(tracks) {
  var data = function() {};

  data.tracks = tracks;

  data.albumStore = store(tracks, function(track) { return track.album; })
    .each(function(album) {
      album.title = album.key;
      album.tracks = album.values;

      var first_track = album.tracks[0];
      album.artist = first_track.artist;
      album.year = first_track.year;
      album.added = first_track.added;
      album.played_tracks_count = album.tracks.reduce(function(sum, track) {
        return track.play_count ? sum + 1 : sum;
      }, 0);
      album.play_ratio = album.tracks.reduce(function(sum, track) {
        return track.play_count ? sum + parseInt(track.play_count) : sum;
      }, 0) / album.tracks.length;
    });


  data.monthStore = store(data.albumStore.all(), function(album) {
    var split = album.added.split('T')[0].split('-')
    return split[0] + '/' + split[1];
  });

  data.artistStore = store(data.albumStore.all(), function(album) { return album.artist; });
  data.artistStore.each(function(artist) {
    artist.name = artist.key;
    artist.albums = artist.values;
    artist.play_ratio = artist.albums.reduce(function(sum, album) {
      return sum + album.play_ratio;
    }, 0) / artist.albums.length;
  });


  var sortByPlayRatio = function(a, b) { return b.play_ratio - a.play_ratio; }
  data.sortedAlbums = data.albumStore.all().sort(sortByPlayRatio);
  data.sortedArtists = data.artistStore.all().sort(sortByPlayRatio);

  return data;
}

module.exports = buildData(tracks);

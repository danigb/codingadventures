'use strict';

var React = require('react');
var data = require('../data.js');

module.exports = React.createClass({
  render: function() {
    var album = data.albumStore.get(this.props.title);

    return (
      <div className="album">
        <h3>({this.props.position}) {album.title}</h3>
        <div>{album.artist}</div>
        <div>{album.year}</div>
        <div>{album.play_ratio}</div>
        <div>({album.played_tracks_count}/{album.tracks.length})</div>
      </div>
    );
  }
});

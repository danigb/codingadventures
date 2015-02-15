'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    var album = this.props.album;

    return (
      <div className="album">
        <h3><span className="position">{this.props.position}. </span>{album.title}</h3>
        <div>{album.artist}</div>
        <div>{album.year}</div>
        <div>{album.play_ratio}</div>
        <div>({album.played_tracks_count}/{album.tracks.length})</div>
      </div>
    );
  }
});

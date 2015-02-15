'use strict';

var React = require('react');
var Month = require('./view/month.js');
var Album = require('./view/album.js');
var Artist = require('./view/artist.js');
var Grid = require('./view/grid.js')
var data = require('./data.js');

var App = React.createClass({
  renderMonth: function(month, index) {
    return <Month key={month.key} month={month} />
  },
  renderAlbum: function(album, index) {
    return <Album key={album.key} position={index + 1} album={album} />
  },
  renderArtist: function(artist, index) {
    return <Artist key={artist.key} position={index + 1} artist={artist} />
  },
  render: function() {
    var months = data.sortedMonths.map(this.renderMonth);
    var albums = data.sortedAlbums.slice(0, 40).map(this.renderAlbum);
    var artists = data.sortedArtists.slice(0, 10).map(this.renderArtist);

    return (
      <div>
        <Grid title="Albums" source={data.sortedAlbums} render={this.renderAlbum} />
        <Grid title="Artists" source={data.sortedArtists} render={this.renderArtist} />
        <h3>Months</h3>
        <div className="months">{months}</div>
      </div>
    );
  }
});

React.render(<App/>, document.body);

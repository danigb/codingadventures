'use strict';

var React = require('react');
var Month = require('./view/month.js');
var Album = require('./view/album.js');
var Artist = require('./view/artist.js');
var Grid = require('./view/grid.js')
var data = require('./data.js');

var Months = React.createClass({
  getInitialState: function() {
    return {selectedDay: 'Sin selección', selectedAlbums: []}
  },
  selectDay: function(day, albums) {
    this.setState({selectedDay: day.key, selectedAlbums: albums.values});
  },
  renderMonth: function(month, index) {
    return <Month key={month.key} month={month} onClick={this.selectDay} />
  },
  renderAlbum: function(album, index) {
    return <Album key={album.key} position={index + 1} album={album} />
  },
  render: function() {
    var months = data.sortedMonths.map(this.renderMonth);

    return (
      <div>
        <h3>Meses</h3>
        <div className="months">{months}</div>
        <Grid title={this.state.selectedDay} source={this.state.selectedAlbums} render={this.renderAlbum} />
      </div>
    );
  }
});

var Years = React.createClass({
  renderYear: function(year) {
    return <div>{year.key} {year.values.length}</div>;
  },
  render: function() {
    var years = data.sortedYears.map(this.renderYear);
    console.log("YEARS", data.sortedYears);
    return (
      <div>
        <h3>Años</h3>
        {years}
      </div>
    );
  }
});

var App = React.createClass({
  renderAlbum: function(album, index) {
    return <Album key={album.key} position={index + 1} album={album} />
  },
  renderArtist: function(artist, index) {
    return <Artist key={artist.key} position={index + 1} artist={artist} />
  },
  render: function() {
    return (
      <div>
        <Grid title="Discos" source={data.sortedAlbums} render={this.renderAlbum} />
        <Grid title="Autorxs" source={data.sortedArtists} render={this.renderArtist} />
        <Months />
        <Years />
      </div>
    );
  }
});

React.render(<App/>, document.body);

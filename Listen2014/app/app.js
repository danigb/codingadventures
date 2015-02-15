'use strict';

var React = require('react');
var Month = require('./view/month.js');
var Album = require('./view/album.js');
var Artist = require('./view/artist.js');
var data = require('./data.js');

var Grid = React.createClass({
  getInitialState: function() {
    return {size: 8};
  },
  showMore: function(e) {
    e.preventDefault();
    this.setState({size: this.state.size + 8});
  },
  showLess: function(e) {
    e.preventDefault();
    if(this.state.size > 8) {
      this.setState({size: this.state.size - 8});
    }
  },
  render: function() {
    var items = this.props.source.slice(0, this.state.size)
      .map(this.props.render).map(function(content) {
        return <div className="item">{content}</div>;
      });

    return (
      <div className="grid">
        <h2>{this.props.title}</h2>
        <div className="controls">
          <a href="#" onClick={this.showMore}>+ más</a>
          <a href="#" onClick={this.showLess}>- menos</a>
        </div>
        <div className="items">
          {items}
        </div>
      </div>
    )
  }
});

var App = React.createClass({
  renderMonth: function(month, index) {
    return <Month key={month} month={month} />
  },
  renderAlbum: function(album, index) {
    return <Album key={album.key} position={index + 1} title={album.key} />
  },
  renderArtist: function(artist) {
    return <Artist key={artist.key} artistName={artist.name} />
  },
  render: function() {
    var months = data.monthStore.keys().map(this.renderMonth);
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

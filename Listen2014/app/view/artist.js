'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    var artist = this.props.artist;
    var position = this.props.position;

    return (
      <div className="Artist">
        <h3><span className="position">{position}. </span>{artist.name}</h3>
      </div>
    );
  }
});

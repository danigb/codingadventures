'use strict';

var React = require('react');
var data = require('../data.js');

module.exports = React.createClass({
  render: function() {
    var artist = data.artistStore.get(this.props.artistName);

    return (
      <div className="Artist">
        <span>{artist.name}</span> |
      </div>
    );
  }
});

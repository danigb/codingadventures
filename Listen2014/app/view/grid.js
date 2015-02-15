'use strict';

var React = require('react');

module.exports = React.createClass({
  getInitialState: function() {
    return {rows: 1, itemsPerRow: 10};
  },
  showMore: function(e) {
    e.preventDefault();
    this.setState({rows: this.state.rows + 1});
  },
  showLess: function(e) {
    e.preventDefault();
    if(this.state.rows > 1) {
      this.setState({rows: this.state.rows - 1});
    }
  },
  getItemStyle: function() {
    var w = (Math.floor(9600 / this.state.itemsPerRow) / 100).toString() + "%";
    var m = (Math.floor(400 / this.state.itemsPerRow) / 100).toString() + "%";
    return { width: w, paddingBottom: w, marginRight: m, marginBottom: m };
  },
  render: function() {
    var style = this.getItemStyle();
    var items = this.props.source.slice(0, this.state.rows * this.state.itemsPerRow)
      .map(this.props.render).map(function(content) {
        return <div className="item" style={style}>{content}</div>;
      });

    return (
      <div className="grid">
        <h2>{this.props.title}</h2>
        <div className="items">
          {items}
        </div>
        <div className="controls">
          <a href="#" onClick={this.showMore}>+ más</a>
          <a href="#" onClick={this.showLess}>- menos</a>
        </div>
      </div>
    )
  }
});

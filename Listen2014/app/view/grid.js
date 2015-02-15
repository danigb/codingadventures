'use strict';

var React = require('react');

module.exports = React.createClass({
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

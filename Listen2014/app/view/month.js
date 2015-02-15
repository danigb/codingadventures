'use strict';

var React = require('react');
var data = require('./../data.js');

var MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
module.exports = React.createClass({
  days: function() {
    var days = [];
    for(var i = 0; i < 31; i++) { days[i] = i; }
    return days;
  },
  monthTitle: function() {
    var num = parseInt(this.props.month.split('/')[1]);
    return MONTHS[num - 1];
  },
  monthCount: function() {
    var month = data.monthStore.get(this.props.month);
    return month.values.length;
  },
  renderDay: function(day) {
    return <div className="day">{day}</div>
  },
  render: function() {
    var days = this.days().map(this.renderDay);
    return (
      <div className="month">
        <div className="label">
          <span>{this.monthTitle()}</span>
          <span> ({this.monthCount()})</span>
        </div>
        {days}
      </div>
    );
  }
});

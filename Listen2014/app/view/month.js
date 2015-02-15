'use strict';

var React = require('react');

var MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
var DAYS = ['D','L','M','X','J','V','S'];
var PADDING = [6,0,1,2,3,4,5];

function parseDate(input) {
  var parts = input.split('-');
  return new Date(parts[0], parts[1]-1, parts[2], 8); // Note: months are 0-based
}
function dateToKey(date) {
  return date.getFullYear()+'-'+ (date.getMonth()+1) +'-'+date.getDate();
}

function paddingDays(monthKey) {
  var firstDay = parseDate(monthKey + '-01');
  var num = PADDING[firstDay.getDay()];
  var days = [];
  for (var i = 0; i < num; i++) { days[i] = i; }
  return days;
}

module.exports = React.createClass({
  days: function() {
    var sep, key;
    var days = [];
    for(var i = 0; i < 31; i++) {
      sep = i < 10 ? '-0' : '-';
      key = this.props.month.key + sep + (i + 1);
      days[i] = { key: key, num: i + 1 }
    }
    return days;
  },
  monthTitle: function() {
    var month = this.props.month;
    var num = parseInt(month.key.split('-')[1]);
    return MONTHS[num - 1];
  },
  monthCount: function() {
    var month = this.props.month;
    return month.values.length;
  },
  renderDay: function(day) {
    var dayAlbums = this.props.month.dayStore.get(day.key);
    var albumCount = dayAlbums ? dayAlbums.values.length : 0;
    var date = parseDate(day.key);

    var styles = {
      background: albumCount == 0 ? '#DDD' :
        "hsl(150, 91%, " + (90 - albumCount * 2) + "%)"
    }
    var handler = this.props.onClick;

    return (
      <div key={day.key} className="day" onClick={function() { handler(day, dayAlbums); }} style={styles}>
        <div className="info">{DAYS[date.getDay()]} {day.num}</div>
        <div className="count">{albumCount}</div>
      </div>
    );
  },
  renderPadding: function(day) {
    var key = this.props.month.key + "-padding" + day;
    return <div key={key} className="day"></div>;
  },
  render: function() {
    var padding = paddingDays(this.props.month.key).map(this.renderPadding);
    var days = this.days().map(this.renderDay);
    return (
      <div className="month">
        <div className="label">
          <span>{this.monthTitle()}</span>
          <span> ({this.monthCount()})</span>
        </div>
        {padding}
        {days}
      </div>
    );
  }
});

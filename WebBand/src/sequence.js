'use strict';
var SortedArray = require("sorted-array");

// Sequence
// --------
// Build music patterns with simple syntax
// Based on Music As Data : http://mad.emotionull.com/
// Parser based on: https://github.com/maryrosecook/littlelisp


// Parser
// ------
var tokenize = function(input) {
  return input.split('"')
              .map(function(x, i) {
                 if (i % 2 === 0) { // not in string
                   return x.replace(/[\(\[\{]/g, ' ( ')
                           .replace(/[\)\]\}]/g, ' ) ')
                           .replace(/\|/g, ' ')
                           .replace(/\,/g, ' ');
                 } else { // in string
                   return x.replace(/ /g, "!whitespace!");
                 }
               })
              .join('"')
              .trim()
              .split(/\s+/)
              .map(function(x) {
                return x.replace(/!whitespace!/g, " ");
              });
};


var parenthesize = function(input, list) {
  if (list === undefined) {
    return parenthesize(input, []);
  } else {
    var token = input.shift();
    if (token === undefined) {
      return list;
    } else if (token === "(") {
      list.push(parenthesize(input, []));
      return parenthesize(input, list);
    } else if (token === ")") {
      return list;
    } else {
      return parenthesize(input, list.concat(token));
    }
  }
};

var unbox = function(array) {
  return (array.length == 1 && Array.isArray(array[0])) ?
    unbox(array[0]) : array;
}

var parse = function(input) {
  return Array.isArray(input) ? input : unbox(parenthesize(tokenize(input)));
};

var buildSequence = function(ast, position, duration, sequence) {
  return ast.reduce(function(seq, item) {
    var element = Array.isArray(item) ?
      buildSequence(item, position, (duration / item.length), []) :
      event(position, duration, item);
    position += duration;
    return seq.concat(element);
  }, sequence);
}

// Sequence
//---------
// A sequence is a list of events
var event = function(position, duration, value) {
  return { position: position, duration: duration, value: value };
}
var printEvent = function(e) {
  return "[" + e.position + ":" + e.duration + "]" + e.value;
}

var Sequence = function(events, duration, position) {
  events = events || [];
  events = Array.isArray(events) ? events : buildSequence(parse(events), position || 0, duration || 1, []);
  this.list = new SortedArray(events);
  return this;
}
Sequence.prototype.addEvent = function(position, duration, value) {
  this.list.insert(event(position, duration, value));
}
Sequence.prototype.toString = function() {
  return this.list.array.map(printEvent).join(' ');
}
Sequence.prototype.forEach = function(callback) {
  return this.list.array.forEach(callback);
}

Sequence.parse = parse;

module.exports = Sequence;

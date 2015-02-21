'use strict';

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

var parse = function(input) {
  return Array.isArray(input) ? input : parenthesize(tokenize(input));
};

module.exports = parse;

'use strict';

var parse = require('./parse.js');

function sheet(name) {
  var sheet = {};
  sheet.name = name;
  sheet.parts = {};

  sheet.part = function(name, part) {
    if (arguments.length == 1) return sheet.parts[name];
    sheet.parts[name] = {};
    for(var k in part) {
      sheet.parts[name][k] = parse(part[k]);
    }
    return sheet;
  }

  sheet.sections = function(name) {
    return Object.keys(sheet.parts[name]);
  }

  return sheet;
}

module.exports = sheet;

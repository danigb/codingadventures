'use strict';

var get = require('../utils/get.js');
var base64DecodeToArray = require('../utils/base64decode.js');

function decodeNoteAudioData(context, data) {
  return new Promise(function(resolve, reject) {
    var decodedData = base64DecodeToArray(data.split(",")[1]).buffer;
    context.decodeAudioData(decodedData, function(buffer) {
      resolve(buffer);
    }, function(e) {
      reject("DecodeAudioData error", e);
    });
  });
}

function addNote(instrument, key, buffer) {
  var ctx = instrument.context;
  var note = instrument.notes[key] = {}
  note.buffer = buffer;
  note.play = function(time) {
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(time);
  };
}


function decodeNotes(instrument, data) {
  var promises = Object.keys(data).map(function(key) {
    return decodeNoteAudioData(instrument.context, data[key])
    .then(function(buffer) {
      addNote(instrument, key, buffer);
    });
  });

  return Promise.all(promises);
}

function soundfont(ctx, name) {
  var instrument = function(note) {
    note = note.toUpperCase();
    console.debug(instrument.notes);
    console.log("joder", note, instrument.notes[note]);
    return instrument.notes[note];
  };
  instrument.context = ctx;
  instrument.notes = {};

  return new Promise(function (resolve, reject) {
    var url = '/soundfonts/' + name + '-ogg.js';
    return get(url)
      .then(JSON.parse)
      .then(function(data) {
        console.log("JSON parsed");
        return decodeNotes(instrument, data);
      })
      .then(function() {
        console.log("Notes decoded");
        resolve(instrument);
      });
  });
}

module.exports = soundfont;

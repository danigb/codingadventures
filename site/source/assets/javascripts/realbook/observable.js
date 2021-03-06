(function() {
  'use strict';

  window.realbook = window.realbook || {};

  window.realbook.observable = function(el, events) {
    el = el || {}

    var callbacks = {}

    el.on = function(events, fn) {
      if (typeof fn == 'function') {
        events.replace(/\S+/g, function(name, pos) {
          (callbacks[name] = callbacks[name] || []).push(fn)
          fn.typed = pos > 0
        })
      }
      return el
    }

    el.off = function(events, fn) {
      if (events == '*') callbacks = {}
      else if (fn) {
        var arr = callbacks[events]
        for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
          if (cb == fn) { arr.splice(i, 1); i-- }
        }
      } else {
        events.replace(/\S+/g, function(name) {
          callbacks[name] = []
        })
      }
      return el
    }

    // only single event supported
    el.one = function(name, fn) {
      if (fn) fn.one = 1
      return el.on(name, fn)
    }

    el.trigger = function(name) {
      var args = [].slice.call(arguments, 1),
          fns = callbacks[name] || []

      for (var i = 0, fn; (fn = fns[i]); ++i) {
        if (!fn.busy) {
          fn.busy = 1
          fn.apply(el, fn.typed ? [name].concat(args) : args)
          if (fn.one) { fns.splice(i, 1); i-- }
           else if (fns[i] !== fn) { i-- } // Makes self-removal possible during iteration
          fn.busy = 0
        }
      }
      return el
    }

    if (events) {
      for (var event in events) {
        el.on(event, events[event]);
      }
    }
    return el
  }
})();

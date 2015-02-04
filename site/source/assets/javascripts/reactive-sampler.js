(function($) {
  $(function() {
    var seq = $('#sequencer');
    var move = Rx.Observable.fromEvent(seq, 'mousemove')
      .map(function(e) {
        return [e.pageX, e.pageY];
      })
    move.subscribe(function (e) {
      console.log(e);
    });
  });
})(jQuery);


# Schedule

We are going to make a simpler version of excellent Chis Wilson's tutorial
[A Tale of Two Clocks - Scheduling Web Audio with Precision](http://www.html5rocks.com/en/tutorials/audio/scheduling)

The idea: when press play we are going to periodically calculate the distance in time
from the current time to the next beat the rhythm box has to play.
If that distance is less than a threshold, we will schedule the samples using
the Web Audio API timing infrastructure.

Let's try `public/beatbox/audio/scheduler.js.coffee`
~~~coffee
scheduleAheadTime = 0.1
tickIntervalMs = 100

class Scheduler
  constructor: (@context, tempo, @scheduleBeat) ->
    @setTempo(tempo)
    @timerID = null

  setTempo: (newTempo) ->
    @tempo = newTempo
    @secondsPerBeat = 60.0 / @tempo

  start: ->
    return if @timerID != null
    @nextBeat = 0
    @nextBeatTime = @context.currentTime
    @timerID = setInterval(@_tick, tickIntervalMs)

  stop: ->
    return if !@timerID
    clearInterval(@timerID)
    @timerID = null

  _tick: =>
    while @nextBeatTime - @context.currentTime < scheduleAheadTime
      @scheduleBeat(@nextBeat, @nextBeatTime)
      @nextBeat++
      @nextBeatTime += @secondsPerBeat


module.exports = Scheduler
~~~

And some wire:
~~~coffee
scheduler = new Scheduler context, 80, (beat, time)->
  console.log("Beat: #{beat}")
~~~

## Play and stop

Pass scheduler to TransportComponent
~~~coffee
in app.js:
  BeatboxComponent(pattern: pattern, scheduler: scheduler)

in beatbox.js.coffee:
  (TransportComponent(scheduler: @props.scheduler))
  (PatternComponent(pattern: @props.pattern))

in transport.react.js.coffee:
  getInitialState: -> { tempo: @props.scheduler.tempo }
~~~


The TransportComponent handles the events:
~~~coffee
handlePlay: -> @props.scheduler.start()
handleStop: -> @props.scheduler.stop()
~~~

# Play the sounds
~~~coffee
scheduler = new Scheduler context, tempo: 80, scheduleBeat: (beat, time)->
  for track in pattern.tracks
    step = track.steps[beat % 16]
    if step.mute == false
      track.sample.play(time)
~~~

# Some animation

~~~
npm install --save jquery
~~~

`app.js.coffee`
~~~coffee
$ = require 'jquery'
scheduler = new Scheduler context, tempo: 80, scheduleBeat: (beat, time)->
  pattern.playStepsAt(beat % 16, time)
  $('.active').removeClass('active')
  $(".beatbox-step.step-#{(beat % 16) + 1}").addClass('active')
~~~

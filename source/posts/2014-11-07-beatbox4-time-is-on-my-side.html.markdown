---
:title: 'Beatbox 4: Time is on my side'
:tags:
:date: 2014-11-07
---
The last part is to add a note shedule mechanism. We are going to use the same technique described in the excellent tutorial [A Tale of Two Clocks - Scheduling Web Audio with Precision](http://www.html5rocks.com/en/tutorials/audio/scheduling).

READMORE


The idea: when press play we are going to periodically calculate the distance in time from the current time to the next beat the rhythm box has to play. If that distance is less than a threshold, we will schedule the samples using the Web Audio API timing infrastructure.

Let's go!

## Schedule mechanism

The Scheduler uses `setInterval` to periodically check the distance from the current time to the next beat. If is less than the `scheduleThreshold` value, then call the `player`, a external method that should launch the samples.

~~~coffee
# public/beatbox/audio/scheduler.js.coffee

scheduleThreshold = 0.1
tickIntervalMs = 100

class Scheduler
  constructor: (@context, options) ->
    @setTempo(options.tempo || 120)
    @player = options.player || ->
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
    while @nextBeatTime - @context.currentTime < scheduleThreshold
      @player(@nextBeat, @nextBeatTime)
      @nextBeat++
      @nextBeatTime += @secondsPerBeat


module.exports = Scheduler
~~~

Let's add some wire and get meditation looking at the console output:

~~~coffee
# public/beatbox/app.js.coffee

...

Scheduler = require('./audio/scheduler.js')
scheduler = new Scheduler context, time: 110, player: (beat, time) ->
  console.log("Beat: #{beat} at #{time}")
scheduler.start()
~~~

## Playing the step sounds

The method to play the sounds is really straightforward:

~~~coffee
# public/beatbox/app.js.coffee

...

scheduler = new Scheduler context, tempo: 80, scheduleBeat: (beat, time)->
  for track in pattern.tracks
    step = track.steps[beat % 16]
    if step.mute == false
      track.sample.play(time)
~~~


## Bind the UI

Ok, we want to start and stop the scheduler when the buttons are pressed:

~~~coffee
# public/beatbox/components/transport.react.js.coffee

TransportComponent = React.createClass
  ...
  handlePlay: -> @props.scheduler.start()
  handleStop: -> @props.scheduler.stop()
~~~

That was easy, but we need to put the scheduler in the Transport's `@props`:

~~~coffee
# at public/beatbox/app.js.coffee:
  BeatboxComponent(pattern: pattern, sampler: sampler, scheduler: scheduler)
~~~

Finally we are going to use the `tempo` from the scheduler:

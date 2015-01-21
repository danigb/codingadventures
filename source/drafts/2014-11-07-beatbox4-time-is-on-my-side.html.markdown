---
:title: 'Beatbox 4: Time is on my side'
:tags:
:date: 2014-11-07
---
The last part is to add a note schedule mechanism. We are going to use the same technique described in the excellent tutorial [A Tale of Two Clocks - Scheduling Web Audio with Precision](http://www.html5rocks.com/en/tutorials/audio/scheduling).

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
    @ticksPerBeat = options.ticksPerBeat || 2
    @onStart = options.onStart || ( -> )
    @onStop = options.onStop || ( -> )
    @onPlay = options.player || ( -> )
    @_timerID = null
    @setTempo(options.tempo || 120)

  setTempo: (newTempo) ->
    @tempo = newTempo
    @_secondsPerTicks = 60.0 / (@tempo * @ticksPerBeat)

  start: ->
    return if @_timerID != null
    @_nextTick = 0
    @_nextTickTime = @context.currentTime
    @_timerID = setInterval(@_schedule, tickIntervalMs)
    @onStart()

  stop: ->
    return if !@_timerID
    clearInterval(@_timerID)
    @_timerID = null
    @onStop()

  _schedule: =>
    while @_nextTickTime - @context.currentTime < scheduleThreshold
      @onPlay(@_nextTick, @_nextTickTime)
      @_nextTick++
      @_nextTickTime += @_secondsPerTick

module.exports = Scheduler
~~~

The code is quite simple. The schedule logic resides at private `_tick` method. The rest is more or less boiler plate code: a configurable ticks per beat options, and some `onEvent` methods to attach listerens.

Let's try it and get meditation for free looking at the console output:

~~~coffee
# public/beatbox/app.js.coffee

...

Scheduler = require('./audio/scheduler.js')
scheduler = new Scheduler context, time: 110)

scheduler.onPlay = (tick, time) ->
  console.log("Beat: #{tick} at #{time}")

scheduler.start()
~~~

## Playing the step sounds

The method to play the sounds is really straightforward:

~~~coffee
# public/beatbox/app.js.coffee

...

scheduler.onPlay = (tick, time)->
  stepIndex = tick % sequence.length
  for sequence in pattern.sequences
    step = sequence.steps[stepIndex]
    sampler.playSample(sequence.name, time) if !step.mute
~~~


## Make the transport work, finally

Ok, we want to start and stop the scheduler when the buttons are pressed:

~~~coffee
# public/beatbox/components/transport.react.js.coffee

TransportComponent = React.createClass
  ...
  handlePlay: -> @props.scheduler.start()
  handleStop: -> @props.scheduler.stop()
~~~

That was easy, but we need to add the scheduler to Transport's `@props`:

~~~coffee
# at public/beatbox/app.js.coffee:

 BeatboxComponent(pattern: pattern, sampler: sampler, scheduler: scheduler)
~~~

And we are going to use the `tempo` from the scheduler (so scheduler became a kind of model for transport):

~~~coffee
# public/beatbox/components/transport.react.js.coffee

Rect = require 'react'
{div, input, button, label} = React.DOM

TransportComponent = React.createClass
  handleTempoChange: (e) ->
    nextTempo = e.target.value
    @props.scheduler.setTempo(nextTempo)
    @forceUpdate()

  handlePlay: -> @props.scheduler.start()
  handleStop: -> @props.scheduler.stop()

  render: ->
    (div {className: 'beatbox-transport'},
      (button {onClick: @handlePlay }, '▶ Play' )
      (button {onClick: @handleStop }, '■ Stop' )
      (label null, "Tempo: #{@props.scheduler.tempo}")
      (input {type: 'range', step: 1, min: 30.0, max: 160,
      onChange: @handleTempoChange, value: @props.scheduler.tempo}
      )
    )

module.exports = TransportComponent
~~~

This fix our long standing issue about the tempo slider: now every tempo change updates the model and the view (using `@forceUpdate`). This works in real time, you can change the tempo while playing. This is one advantage of the schedule mechanism.


## Add some visuals

While this is working, I want to see the steps turning on and off while the schedule works. Probably the best way is use some external library (like jquery or zepto) but I will roll my own:

And there's the visual logic:

~~~coffee
# public/beatbox/app.js.coffee

addClass = (element, className) -> element.classList.add(className)
removeClass = (element, className) -> element.classList.remove(className)

highlightColumn = (stepIndex) ->
  prevStepIndex = if stepIndex == 0 then pattern.length - 1 else stepIndex - 1
  addClass(el, 'active') for el in document.getElementsByClassName("step-#{stepIndex}")
  removeClass(el, 'active') for el in document.getElementsByClassName("step-#{prevStepIndex}")
~~~

And bind this to the schedule events:

~~~coffee
scheduler.onPlay = (beat, time) ->
  stepIndex = beat % pattern.length
  highlightColumn(stepIndex)
  ...

scheduler.onStop = ->
  removeClass(el, 'active') for el in document.getElementsByClassName('step')
~~~

And now the sequencer is fully working:

[Demo 5: Beatbox complete](/beatbox-demo/demo5-complete/index.html)

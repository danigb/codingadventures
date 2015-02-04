
Source structure:
~~~
public/beatbox
  |
  + apps.js.coffee
  + components
    |
    + component1.react.js.coffee
    ...
  + models
    |
    + model1.js.coffee
~~~

Create a simple component `public/beatbox/components/transport.react.js.coffee`
~~~coffeescript
React = require 'react'

{div, input, button, a, label} = React.DOM

TransportComponent = React.createClass
  getInitialState: -> { tempo: @props.tempo }

  handleTempoChange: ->
    nextTempo = @refs.tempoRange.getDOMNode().value
    @setState(tempo: nextTempo)

  handlePlay: -> console.log("Play")
  handleStop: -> console.log("Stop")

  render: ->
    (div {className: 'beatbox-transport'},
      (button {onClick: @handlePlay }, 'Play' )
      (button {onClick: @handleStop }, 'Stop' )
      (label { }, "Tempo: #{@state.tempo}")
      (input
        type: 'range', step: 1, min: 30.0, max: 160,
        ref: 'tempoRange', onChange: @handleTempoChange
        value: @state.tempo
      )
    )

module.exports = TransportComponent
~~~

- Difference between props and state!


And bind it into the app (`public/beatbox/app.js.coffee`):
~~~coffeescript
React = require 'react'
Transport = React.createFactory(require('./components/transport.react.js'))

React.render Transport(tempo: 123), document.getElementById('beatbox')
~~~

Change script src in index.html to `/beatbox/app.js`. We shoud see a couple of buttons and a slider.

Things to note:
- We **don't** use JSX, but syntax is nice
- We handle events inside the component with normal function binding
- Each time we call setState, React will call render

## Models and props

Create first model `public/beatbox/models/track.js.coffee`:
~~~coffeescript
class Track
  constructor: (@name, @stepCount) ->
    @steps = ({num: step, mute: true} for step in [1..@stepCount])

module.exports = Track
~~~

And a component for the model:
~~~coffeescript
React = require 'react'

{div, a} = React.DOM

TrackComponent = React.createClass
  render: ->
    track = @props.track
    steps = {}
    for step in track.steps
      key = "#{track.name}-step#{step.num}"
      muteState = "mute#{if step.mute then 'On' else 'Off'}"
      component = (a {className: "beatbox-step #{muteState}", href: '#'}, step.num)
      steps[key] = component
    (div {className: 'beatbox-track'},
      (a {className: 'head', href: '#'}, track.name)
      (div {className: 'steps'}, steps)
    )

module.exports = TrackComponent
~~~

And we update our `app.js.coffee`:
~~~coffeescript
React = require 'react'

Track = require './models/track.js'
TrackComponent = React.createFactory(require('./components/track.react.js'))

track = new Track('snare', 16)
React.render TrackComponent(track: track), document.getElementById('beatbox')
~~~

To better understand render add this line before `React.render`:
~~~coffeescript
track.steps[num].mute = false for num in [1, 6, 7, 8, 12]
~~~
and you will see the active steps in color (via css)

## Component composability

We want a four track, so first create a new model `public/beatbox/models/pattern.js.coffee`:
~~~coffeescript
Track = require './track.js'

class Pattern
  constructor: (trackNames, @stepCount) ->
    @tracks = (new Track(name, @stepCount, this) for name in trackNames)

module.exports = Pattern
~~~

And we add a new React component at `public/beatbox/components/pattern.react.js.coffee`:
~~~coffeescript
React = require 'react'

TrackComponent = React.createFactory(require('./track.react.js'))

{div} = React.DOM


PatternComponent = React.createClass
  render: ->
    pattern = @props.pattern
    tracks = {}
    for track in pattern.tracks
      tracks["track-#{track.name}"] = TrackComponent(track: track)
    (div {className: 'beatbox-pattern'}, tracks)

module.exports = PatternComponent
~~~

And wire everything in `app.js.coffee`:
~~~coffeescript
React = require 'react'

Pattern = require './models/pattern.js'
PatternComponent = React.createFactory(require('./components/pattern.react.js'))

pattern = new Pattern(['ohihat', 'hihat', 'snare', 'kick'], 16)

React.render PatternComponent(pattern: pattern), document.getElementById('beatbox')
~~~

You should see the pattern.

We want to compose the pattern and the transport into a top-level component `public/beatbox/components/beatbox.react.js.coffee`:
~~~coffeescript
React = require 'react'
TransportComponent = React.createFactory(require('./transport.react.js'))
PatternComponent = React.createFactory(require('./pattern.react.js'))

{div} = React.DOM

BeatboxComponent = React.createClass
  render: ->
    (div {className: 'beatbox'},
      (TransportComponent(tempo: @props.tempo))
      (PatternComponent(pattern: @props.pattern))
    )

module.exports = BeatboxComponent
~~~

And update `app.js.coffee` acordely:
~~~coffeescript
React = require 'react'

Pattern = require './models/pattern.js'
BeatboxComponent = React.createFactory(require('./components/beatbox.react.js'))

pattern = new Pattern(['ohihat', 'hihat', 'snare', 'kick'], 16)
React.render BeatboxComponent(tempo: 80, pattern: pattern), document.getElementById('beatbox')
~~~

## Add some user interactivity

~~~coffeescript
React = require 'react'

{div, a} = React.DOM

TrackComponent = React.createClass
  handleClick: (e) ->
    stepName = e.target.textContent || e.target.innerText
    step = @props.track.steps[parseInt(stepName) - 1]
    step.mute = !step.mute
    @forceUpdate()

  render: ->
    track = @props.track
    steps = {}
    for step in track.steps
      key = "#{track.name}-step-#{step.num}"
      muteState = "mute#{if step.mute then 'On' else 'Off'}"
      component = (a {className: "beatbox-step #{muteState}",
      href: '#', onClick: @handleClick}, step.num)
      steps[key] = component
    (div {className: 'beatbox-track'},
      (a {className: 'head', href: '#'}, track.name)
      (div {className: 'steps'}, steps)
    )

module.exports = TrackComponent
~~~

- Where to put the handle event
- Flux architecture: data flow. This is not the case

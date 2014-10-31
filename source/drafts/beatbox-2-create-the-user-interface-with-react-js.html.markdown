---
title: 'Beatbox 2: Create the user interface with react.js'
# date: TBD When publishing
tags: tutorial, web audio api, react, coffeescript
---

# Beatbox 2: Create the user interface with react.js

In the [first part](/2014/10/31/beatbox-build-a-rhythm-machine-with-react-js.html)
we setup a little development server and installed react library. We are ready
to use it.

The app structure will be this one:

~~~coffee
public/beatbox
  |
  + app.js.coffee
  + components
    |
    + component1.react.js.coffee
    ...
  + models
    |
    + model1.js.coffee
~~~

where `components` is the name react uses to define a reusable view. I will
append the `react` suffix to recognize easily, but is not required. The models
are the data structures we use describe our drum machine.

##Transport view

In sequencer softwares, the transport view is where the start and stop button
lives. We will add also a tempo input using a range.
Here is `public/beatbox/components/transport.react.js.coffee`:

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

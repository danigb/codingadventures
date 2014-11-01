---
title: 'Beatbox 2: Create the user interface with react.js'
# date: TBD When publishing
tags: tutorial, web audio api, react, coffeescript
---

# Beatbox 2: Create the user interface with react.js

In the [first part](/2014/10/31/beatbox-build-a-rhythm-machine-with-react-js.html) we setup a little development server and installed react library. We are ready to use it.

Now we'll use react to build the user interface.

### Components

The most important concept inside react is 'reusable components'. They are a way to encapsulate some bits of html and functions with a well defined interface. Yes, you read well: the markup code will be defined **inside** the component source. They created a javascript syntax extension called [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) in order to simplify the process, but we won't use it since we have Coffeescript powers (more on that just below).

Normally, every component has a model associated to it that represents the application data we want to display and interact to. React doesn't provide any model facilities, so we have to roll our own.

With this two concepts in mind, our application directory structure will be something like this:

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

### Disgression @props vs. @state

Every component has two attributes (`@props` and `@state`) that contains application state. One of the first difficulties for me at the beginning was understand when I should use one or the other.

After some hacking, experimentation and, ahem, [documentation reading](http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html#components-are-just-state-machines) the concept is now clear: **state** makes reference to **visual** state, while **props** are referred to application state (from domain model).

If you have doubts, make this **simple test**: if we need to access some state value outside a component, then use @prop else use @state.

A good example of @state could be the `visible` state of a collapsable panel. This is pure UI state, and normally we don't need to know outside the component if the panel is visible or hidden.

## First component: the transport view

In sequencer softwares, the transport is where the start and stop button lives. We will add also a tempo input using a range.
Here is my first attempt to write it `public/beatbox/components/transport.react.js.coffee`:

~~~coffeescript
React = require 'react'

{div, input, button, label} = React.DOM

TransportComponent = React.createClass
  handleTempoChange: ->
    nextTempo = @refs.tempoRange.getDOMNode().value
    console.log("Tempo changed: #{nextTempo}")

  handlePlay: -> console.log("Play")
  handleStop: -> console.log("Stop")

  render: ->
    (div {className: 'beatbox-transport'},
      (button {onClick: @handlePlay }, 'Play' )
      (button {onClick: @handleStop }, 'Stop' )
      (label { }, "Tempo: #{@props.tempo}")
      (input
        type: 'range', step: 1, min: 30.0, max: 160,
        ref: 'tempoRange', onChange: @handleTempoChange
        value: @props.tempo
      )
    )

module.exports = TransportComponent
~~~

There are several things to note here. As I told you before, I **don't** use react's  [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) syntax. Some coffeescript sugar is applied instead: [destructuring assignment](http://coffeescript.org/#destructuring) at line 3 and then some clever use of coffeescript flexible syntax. The idea is [not mine](http://blog.vjeux.com/2013/javascript/react-coffeescript.html) and I like it.

Then we need to create the component and add it to the browser DOM. We will do it inside `public/beatbox/app.js.coffee`:

~~~coffeescript
React = require 'react'
Transport = React.createFactory(require('./components/transport.react.js'))

React.render Transport(tempo: 123), document.getElementById('beatbox')
~~~

Change script src in index.html to `/beatbox/app.js`. We shoud see a couple of buttons and a slider.

<div class="demo">
  <a href="/beatbox-demo/transport/">Demo: Transport, first attempt</a>
</div>

## Our first model: the Pattern

As you can see in the demo, you can't move the tempo slider, but you can read by the console.log output that the events are dispatching. This is the **normal** operation, but it looks a little bit awkward at first. The is an important react concept, the **data flow is one way only**: a component will render a model. If the model doesn't change, view stay the same. And we didn't change the model... but we will write one first: (`public/models/pattern.js.coffee`)

~~~coffee
class Pattern
  tempo: 123

module.exports = Pattern
~~~

We bind the model to the component in the `app.js.coffee` file:

~~~coffee
Pattern = require('./models/pattern.js')
Transport = React.createFactory(require('./components/transport.react.js'))

pattern = new Pattern(120)
React.render Transport(pattern: pattern), document.getElementById('beatbox')
~~~

And finally we change the `render` method of our TransportComponent so instead of `@props.tempo` we will use `@props.pattern.tempo`. Also the `handleTempoChange` method will be like this:

~~~ Coffee
TransportComponent = React.createClass
  handleTempoChange: ->
    nextTempo = @refs.tempoRange.getDOMNode().value
    @props.pattern.tempo = nextTempo
    @forceUpdate()
~~~

Now, the transport slider work as normal:

[Demo 2: Pattern model and tempo slider](/beatbox-demo/pattern-model/index.html)

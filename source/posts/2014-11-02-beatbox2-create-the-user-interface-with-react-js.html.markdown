---
:title: 'Beatbox 2: Create the user interface with react.js'
:tags: tutorial, web audio api, react, coffeescript
:date: 2014-11-02
---

![Roland TR-808](http://upload.wikimedia.org/wikipedia/commons/b/be/Roland_TR-808_drum_machine.jpg)


In the [first part](/2014/10/31/beatbox-build-a-rhythm-machine-with-react-js.html) we setup a little development server and installed react library. We are ready to use it.

Now we'll use react to build the user interface.

READMORE

## Components

The most important concept inside react is 'reusable components'. They are a way to encapsulate some bits of html, data and functionallity with a well defined interface. Yes, you read well: **the markup code will be defined inside the component source**. They created a javascript syntax extension called [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) in order to simplify the process, but we won't use it since we have Coffeescript powers (more on that just below).

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

Here is my first attempt to write it:

~~~coffeescript
# public/beatbox/components/transport.react.js.coffee

React = require 'react'

{div, input, button, label} = React.DOM

TransportComponent = React.createClass
  handleTempoChange: (e) ->
    nextTempo = e.target.value
    console.log("Tempo changed: #{nextTempo}")

  handlePlay: -> console.log("Play")
  handleStop: -> console.log("Stop")

  render: ->
    (div {className: 'beatbox-transport'},
      (button {onClick: @handlePlay }, '▶ Play' )
      (button {onClick: @handleStop }, '■ Stop' )
      (label null, "Tempo: #{@props.tempo}")
      (input {type: 'range', step: 1, min: 30.0, max: 160,
      onChange: @handleTempoChange, value: @props.tempo}
      )
    )

module.exports = TransportComponent

~~~

There are several things to note here:

- As I told you before, I **don't** use react's  [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) syntax. Some coffeescript sugar is applied instead: [destructuring assignment](http://coffeescript.org/#destructuring) at line 3 and then some clever use of coffeescript flexible syntax. The idea is [not mine](http://blog.vjeux.com/2013/javascript/react-coffeescript.html) and I like it.
- We bind events to functions with plain javascript, but in a way that resembles very much to html. Note that the name of the event is in camel cased (`onClick`) instead of the html standard `onclick`
- There's no magin in event handlers. It's the standard DOM: we receive a event parameter and we can access the `target` there (among other things).

In order to see the component in action, we need to create and add it to the browser document. We'll do this kind of plumbing inside `app.js.coffee`:

~~~coffeescript
# public/beatbox/app.js.coffee

React = require 'react'
Transport = React.createFactory(require('./components/transport.react.js'))

React.render Transport(tempo: 123), document.getElementById('beatbox')
~~~

Change script's `src` attribute at `index.html` to `/beatbox/app.js` and you shoud see a couple of buttons and a slider.

[Demo 1: Transport, first try](/beatbox-demo/demo1-transport/index.html)


### Controlled components

If you open the browser's web console inside the demo, you will notice that **you can't move the tempo slider** but the method `handleTempoChange` is  **executed and print different values!** This is the **normal react's operation**, but it looks a little bit awkward at first. The is an important react concept, the **data flow is one way only**: a component will render a model. If the model doesn't change, view stay the same.

It's called a 'controlled component' and you can read more about it [here](http://facebook.github.io/react/docs/forms.html#controlled-components)

## Pattern and Sequence, the models.

First, nomenclature. Our drum machine will have a matrix of buttons:

![EKO Computerrhythm](http://bluestone.by/news_imgs/280420144.jpg)

I will call `Pattern` to this matrix, and each row will be a `Sequence` associated to one sound.

React doesn't provide any model infrastructure. The one we are going to build are trivial since there's no server communication involved. Let's start with the `Sequence`:

~~~coffee
# public/beatbox/models/sequence.js.coffee

class Sequence
  constructor: (@name, @stepCount) ->
    @steps = ({num: step, mute: true} for step in [1..@stepCount])

  toggleStep: (@stepNum) ->
    step = @steps[stepNum - 1]
    step.mute = !step.mute

module.exports = Sequence

~~~

And then a 'Pattern' with the ability to add sequences:

~~~coffee
# public/beatbox/models/pattern.js.coffee

Sequence = require './sequence.js'

class Pattern
  constructor: (@length) ->
    @sequences = []

  addSequence: (name) ->
    @sequences.push(new Sequence(name, @length))

module.exports = Pattern
~~~

And we create a Pattern with four empty sequences:

~~~coffee
# public/beatbox/app.js.coffee

...

Pattern = require('./models/pattern.js')
pattern = new Pattern(16)
pattern.addSequence(name) for name in ['ohat', 'hhat', 'snare', 'kick']
~~~

## Pattern and Sequence, the components

Here is where React shines. First we are going to create the Sequence component. A `SequenceComponent` is just basically a `div` for each step in the sequence inside a another div (the sequence itself).

Also we want to mute or unmute the step when the user clicks over the step div:

~~~coffee
# public/beatbox/components/sequence.react.js.coffee

React = require 'react'

{div, a} = React.DOM

SequenceComponent = React.createClass
  handleStepClick: (e) ->
    e.preventDefault()
    @props.sequence.toggleStep(e.target.text)
    @forceUpdate()

  render: ->
    sequence = @props.sequence
    (div {className: 'beatbox-sequence'},
      (a {className: 'name', href: '#'}, sequence.name)
      (div {className: 'steps'},
        (@_buildStep(sequence.name, step) for step in sequence.steps))
    )

  _buildStep: (name, step) ->
    muteState = "mute#{if step.mute then 'On' else 'Off'}"
    (a {className: "step #{muteState}", href: '#',
    onClick: @handleStepClick}, step.num)

module.exports = SequenceComponent
~~~

As before, we bind the event with a function using pure javascript, no magic here (and we call `preventDefault` to avoid '#' at the url). Also we use the standard DOM `Event` object to access the `taget`'s text. Finally, we assume *someone* associated a `sequence` model to this component (via `@props`).

## Component composability

We want to display more than one sequence at once, so we are going to create a PatternComponent with SequenceComponent as children. This is called 'component composability' in react's nomenclature. As you will see, react makes no distinction between standard HTML components or custom components:

~~~coffee
# public/beatbox/components/pattern.react.js.coffee

React = require 'react'
Sequence = React.createFactory(require('./sequence.react.js'))

{div} = React.DOM

PatternComponent = React.createClass
  render: ->
    pattern = @props.pattern
    (div {className: 'beatbox-pattern'},
      (Sequence(sequence: sequence) for sequence in pattern.sequences)
    )

module.exports = PatternComponent
~~~

## All together now

Finally, since we want to show the pattern and the transport components at the same time, we need a wrapper of both. Thats out `BeatboxComponent`:

~~~coffee
# public/beatbox/components/beatbox.react.js.coffee

React = require 'react'
Pattern = React.createFactory(require('./pattern.react.js'))
Transport = React.createFactory(require('./transport.react.js'))

{div} = React.DOM

BeatboxComponent = React.createClass
  render: ->
    (div {className: 'beatbox'},
      (Transport(@props))
      (Pattern(@props))
    )

module.exports = BeatboxComponent
~~~

And some plumbing at `app.js.coffee`:

~~~coffee
# public/beatbox/app.js.coffee

React = require('react')
Pattern = require('./models/pattern.js')

pattern = new Pattern(110, 16)
pattern.addSequence(name) for name in ['ohat', 'hhat', 'snare', 'kick']

BeatboxComponent = React.createFactory(require('./components/beatbox.react.js'))
React.render BeatboxComponent(tempo: 110, pattern: pattern), document.getElementById('beatbox')
~~~

[Demo 2: UI Assembled](/beatbox-demo/demo2-beatbox-ui/index.html)

*Notice that tempo slider still doesn't work. We will fix it in the [fourth part of this tutorial](/2014/11/07/beatbox-4-time-is-on-my-side)*

Ok, that was all for today. In the [thirth part](/2014/11/05/beatbox-3-play-sounds.html) we will use WebAudio API to play sounds, and [finally](/2014/11/07/beatbox-4-time-is-on-my-side.html) sequence them in time.

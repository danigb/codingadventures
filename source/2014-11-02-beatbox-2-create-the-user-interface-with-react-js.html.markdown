---
:title: 'Beatbox 2: Create the user interface with react.js'
:tags: tutorial, web audio api, react, coffeescript
:date: 2014-11-02
---
# Beatbox 2: Create the user interface with react.js

In the [first part](/2014/10/31/beatbox-build-a-rhythm-machine-with-react-js.html) we setup a little development server and installed react library. We are ready to use it.

Now we'll use react to build the user interface.

## Components

The most important concept inside react is 'reusable components'. They are a way to encapsulate some bits of html, data and functionallity with a well defined interface. Yes, you read well: the markup code will be defined **inside** the component source. They created a javascript syntax extension called [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) in order to simplify the process, but we won't use it since we have Coffeescript powers (more on that just below).

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
  handleTempoChange: (e) ->
    nextTempo = e.target.value
    console.log("Tempo changed: #{nextTempo}")

  handlePlay: -> console.log("Play")
  handleStop: -> console.log("Stop")

  render: ->
    (div {className: 'beatbox-transport'},
      (button {onClick: @handlePlay }, 'Play' )
      (button {onClick: @handleStop }, 'Stop' )
      (label null, "Tempo: #{@props.tempo}")
      (input {type: 'range', step: 1, min: 30.0, max: 160,
        onChange: @handleTempoChange}, value: @props.tempo
      )
    )

module.exports = TransportComponent
~~~

There are several things to note here:

- As I told you before, I **don't** use react's  [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) syntax. Some coffeescript sugar is applied instead: [destructuring assignment](http://coffeescript.org/#destructuring) at line 3 and then some clever use of coffeescript flexible syntax. The idea is [not mine](http://blog.vjeux.com/2013/javascript/react-coffeescript.html) and I like it.
- We bind events to functions with plain javascript, but in a way that resembles very much to html. Note that the name of the event is in camel cased (`onClick`) instead of the html standard `onclick`
- There's no magin in event handlers. It's the standard DOM: we receive a event parameter and we can access the `target` there (among other things).

In order to see the component in action, we need to create and add it to the browser document. We'll do this kind of plumbing inside `public/beatbox/app.js.coffee`:

~~~coffeescript
React = require 'react'
Transport = React.createFactory(require('./components/transport.react.js'))

React.render Transport(tempo: 123), document.getElementById('beatbox')
~~~

Change script src in index.html to `/beatbox/app.js`. We shoud see a couple of buttons and a slider.

[Demo 1: Transport, first try](/beatbox-demo/transport/index.html)


### Controlled components

If you open the browser's web console inside the demo, you will notice that **you can't move the tempo slider** but the method `handleTempoChange` is  **executed and print different values!** This is the **normal react's operation**, but it looks a little bit awkward at first. The is an important react concept, the **data flow is one way only**: a component will render a model. If the model doesn't change, view stay the same.

It's called a 'controlled component' and you can read more about it [here](http://facebook.github.io/react/docs/forms.html#controlled-components)

## Our first model: the Pattern

In a classic drum machine there's a line of buttons. I'll call it 'Sequence':

![Roland TR-808](http://upload.wikimedia.org/wikipedia/commons/b/be/Roland_TR-808_drum_machine.jpg)

_(image source: wikipedia)_

Beatbox will have one of this sequence for each instrument, creating a kind of a matrix that I will call 'Pattern'. Let's choose it as our first model to code (`public/models/pattern.js.coffee`)

~~~coffee
class Pattern
  constructor: (@tempo, @length) ->
    @sequences = []

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

~~~coffee
TransportComponent = React.createClass
  handleTempoChange: ->
    nextTempo = @refs.tempoRange.getDOMNode().value
    @props.pattern.tempo = nextTempo
    @forceUpdate()
~~~

Now, the transport slider work as normal.

[Demo 2: Pattern model and tempo slider](/beatbox-demo/pattern-model/index.html)

## Sequences

Our beatbox is going to be a kind of matrix of buttons (a Pattern) where each row is a Sequence (`public/beatbox/models/sequence.js.coffee`):

~~~coffee
class Sequence
  constructor: (@name, @stepCount) ->
    @steps = ({num: step, mute: true} for step in [1..@stepCount])

module.exports = Sequence
~~~

The model is trivial. Let's move to the component (public/beatbox/components/sequence.react.js.coffee):

~~~coffee
React = require 'react'

{div, a} = React.DOM

SequenceComponent = React.createClass
  handleStepClick: (e) ->
    stepNum = e.target.text
    step = @props.sequence.steps[stepNum - 1]
    step.mute = !step.mute
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

The component is also quite straightforward. As before, we bind the event with a function using pure javascript, no magic here.

Let's test out our new component in `app.js.coffee`:

~~~coffee
Sequence = require('./models/sequence.js')
SequenceComponent = React.createFactory(require('./components/sequence.react.js'))

sequence = new Sequence('kick', 16)
React.render SequenceComponent(sequence: sequence), document.getElementById('beatbox')
~~~

[Demo 3: One sequence](/beatbox-demo/sequence-model/index.html)

## Component composability

We want to display more than one sequence at once, so we are going to create a PatternComponent with SequenceComponent as children. Let's start with models first: add `addSequence` method to the 'Pattern' model (`public/models/pattern.js.coffee`):

~~~coffee
Sequence = require './sequence.js'

class Pattern
  ...
  addSequence(name) ->
    @sequences.push(new Sequence(name, @length))
~~~

Then create the PatternComponent class  (`public/components/pattern.react.js.coffee`):

~~~coffee
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

We do component composition the same way we use html components. Cool.

Let's do some plumbing ('public/beatbox/app.js.coffee'):

~~~coffee
Pattern = require('./models/pattern.js')
PatternComponent = React.createFactory(require('./components/pattern.react.js'))

pattern = new Pattern(120, 16)
pattern.addSequence(name) for name in ['ohat', 'hhat', 'snare', 'kick']
React.render PatternComponent(pattern: pattern), document.getElementById('beatbox')
~~~

[Demo 3: Pattern Component](/beatbox-demo/pattern-component/index.html)

## All together now:

Finally, we want to show the pattern **and** the transport. That's what BeatboxComponent is for (`public/components/beatbox.react.js.coffee`):

~~~coffee
React = require 'react'
Pattern = React.createFactory(require('./pattern.react.js'))
Transport = React.createFactory(require('./transport.react.js'))

BeatboxComponent = React.createClass
  render: ->
    (div {className: 'beatbox'},
      (Transport(pattern: @props.pattern))
      (Pattern(pattern: @props.pattern))
    )

module.exports = BeatboxComponent
~~~

And `app.js.coffee`:

~~~coffee
Pattern = require('./models/pattern.js')
BeatboxComponent = React.createFactory(require('./components/beatbox.react.js'))

pattern = new Pattern(110, 16)
pattern.addSequence(name) for name in ['ohat', 'hhat', 'snare', 'kick']
React.render BeatboxComponent(pattern: pattern), document.getElementById('beatbox')
~~~

[Demo 4: UI Assembled](/beatbox-demo/beatbox-component/index.html)

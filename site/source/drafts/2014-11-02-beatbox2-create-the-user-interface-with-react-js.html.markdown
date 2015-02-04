---
:title: 'Beatbox 2: Create the user interface with react'
:tags: tutorial, web audio api, react, coffeescript
:date: 2014-11-02
---

![Roland TR-808](http://upload.wikimedia.org/wikipedia/commons/b/be/Roland_TR-808_drum_machine.jpg)


In the [first part](/2014/10/31/beatbox-build-a-rhythm-machine-with-react-js.html) we setup our development tools. Now we'll use react library to build the user interface.

READMORE

## Components

The most important concept inside react is 'reusable components'. They encapsulates some bits of html, data and functionality with a well defined interface. Yes, you read well: **the markup code will be defined inside the component source**. There's a javascript syntax extension called [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) to make the code look more *htmlish*, but we won't use it since we have coffeescript super-powers (more on that just below).

Normally, every component has a model associated to it that represents the application data we want to display and interact to. React doesn't provide any model facilities, so we have to roll our own.

With this two concepts in mind, our application directory structure will be something like this:

~~~coffee
client
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

Every component has two attributes (`@props` and `@state`) that contains application state. The biggest difficulty I found at the beginning was understand when I should use one or the other.

I'm not the only one to have this problem, it seems to be a very common one. There's some [react's documentation](http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html#components-are-just-state-machines), with some condradictory (in my opinion advices):

> "Most of your components should simply take some data from props and render it"

> State should contain data that a component's event handlers may change to trigger a UI update.

But until I read the Hoosuite's [react-guide about props vs state](https://github.com/uberVU/react-guide/blob/master/props-vs-state.md) I didn't catch the whole idea:

> Component without state is preferable. Even though you clearly **can't do without state** an interactive app

> props are a Component's configuration (...) A Component cannot change its props, but it is responsible for putting together the props of its child Components.

> The state starts with a default value when a Componenent mounts and then suffers from mutations in time (mostly generated from user events) ... A Component manages its own state internally, and don't know anything about children's state.

### Disgression: application architecture

The next question is, how to maintain the domain models sync'ed with the components state? There's a proposed react architecture called [flux](http://facebook.github.io/flux/docs/overview.html) with detailed information about this.

The complete architecture is too much for this tutorial (since there's no server side, for example) but I will follow the core idea: unidirectional data flow.

What I we will do:

- Each component will have one associated model
- When a model is changed, it will trigger an update event
- The component will subscribe model's update events, and will update it's state when one is recived.
- When a user interacts with a component, it will change the associated model (instead of its own the state)

~~~

User ---> (interacts with) ---> Component ---> (updates)
                                    Ʌ             |
                                    |             V
                                  (event) <---  Model
~~~




## First component: a sequence

Our drum machine will have a matrix of buttons:

![EKO Computerrhythm](http://bluestone.by/news_imgs/280420144.jpg)

I will call **pattern** to this matrix, and each row will be a **sequence**. Each sequence is associated to one sound (kick, snare...).

Let's start with the Sequence model:

~~~coffee
# client/models/sequence.js.coffee

MIN_VOL = 0
MAX_VOL = 2

class Sequence
  constructor: (@soundName, @length, @onUpdate) ->
    @steps = ({num: step, vol: MIN_VOL, playing: false } for step in [0..@length - 1])
    @playingStep = null
    @onUpdates = []

  toggleVol: (index) ->
    step = @steps[index % @length]
    step.vol = (step.vol + 1) % (MAX_VOL + 1)
    @fireUpdated()
    step

  setPlaying: (index) ->
    @playingStep.active = false if @playingStep
    @playingStep = if index < 0 then null else @steps[index % @length]
    @playingStep.playing = true if @playingStep
    @fireUpdated()
    @playingStep

  subscribe: (callback) -> @onUpdates.push callback
  fireUpdated: -> callback() for callback in @onUpdates

module.exports = Sequence
~~~

Some things to notice:

- Each sequence is an array of steps. Steps have a volume (0 means no sound, 1 normal, 2 loud) and may be being played at current time.  
- `toggleVol` changes increments step volume by 1. If MAX_VOL is reached, then it mutes the step (vol = 0). The step index works like if the sequence is a loop: it can be greater than the sequence length.
- `setPlaying` sets the currently playing step. **Only one step can be played at time**. It's stored inside `playingStep` attribute
- `subscribe` and `fireUpdated` are the event plumbing

Let's create our first component:


## First component: the transport view

In sequencer softwares, the transport is where the start and stop button lives. We will add also a tempo input using a range.

Here is my first attempt to write it:

~~~coffeescript
# public/beatbox/components/transport.react.js.coffee

React = require 'react'

{div, input, button, label} = React.DOM

TransportComponent = React.createClass
  propTypes:
    tempo: React.PropTypes.number.isRequired

  getInitialState: ->
    tempo: @props.tempo

  handleTempoChange: (e) ->
    newTempo = e.target.value
    @setState(tempo: newTempo)

  handlePlay: -> console.log("Play")
  handleStop: -> console.log("Stop")

  render: ->
    (div {className: 'beatbox-transport'},
      (button {onClick: @handlePlay }, '▶ Play' )
      (button {onClick: @handleStop }, '■ Stop' )
      (label null, "Tempo: #{@state.tempo}")
      (input {type: 'range', step: 1, min: 30.0, max: 160,
      onChange: @handleTempoChange, value: @state.tempo}
      )
    )

module.exports = TransportComponent
~~~

There are several things to note here:

- Since the component is going to change the tempo, it's stored inside `state`
- As I told you before, I **don't** use react's  [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) syntax. Some coffeescript sugar is applied instead: [destructuring assignment](http://coffeescript.org/#destructuring) at line 3 and then some clever use of coffeescript flexible syntax. The idea is [not mine](http://blog.vjeux.com/2013/javascript/react-coffeescript.html) and I like it.
- We bind events to functions with plain javascript, but in a way that resembles very much to html. Note that the name of the event is in camel cased (`onClick`) instead of the html standard `onclick`
- There's no magic in event handlers. It uses the standard DOM event mechanism: we receive an `event` parameter so we can access the `target` there (among other things).
- propTypes attribute is optional. It's used by react to [validate component properties](http://facebook.github.io/react/docs/reusable-components.html#prop-validation) (in development mode only) and, more important to me, add some documentation to the props (read: configuration) of the component.

In order to see the component in action, we need to create and add it to the browser document. We'll do this kind of plumbing inside `app.js.coffee`:

~~~coffeescript
# public/beatbox/app.js.coffee

React = require 'react'
Transport = React.createFactory(require('./components/transport.react.js'))

React.render Transport(tempo: 123), document.getElementById('beatbox')
~~~

Change script's `src` attribute at `index.html` to `/beatbox/app.js` and you shoud see a couple of buttons and a slider.

[Demo 1: Transport, first try](/beatbox-demo/demo1-transport/index.html)


## Pattern and Sequence, the models.



React doesn't provide any model infrastructure. The one we are going to build are trivial since there's no server communication involved. Let's start with the `Sequence`:



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

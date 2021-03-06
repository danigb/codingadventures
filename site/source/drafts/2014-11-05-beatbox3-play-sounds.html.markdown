---
:title: 'Beatbox 3: play sounds'
:tags: tutorial, web audio api, coffeescript
:date: 2014-11-05
---

In [the second part](/2014/11/02/beatbox2-create-the-user-interface-with-react-js) of this tutorial we built the user interface for our drum machine. Now we are going to learn how to play sounds using the Web Audio API.

READMORE

If you look at the [user interface demo](/beatbox-demo/demo2-beatbox-ui/index.html), at the left of the sequence steps there is a link with the name of the instrument. The goal of this part is play the sound then the user clicks the name. Let's go!



## Load sounds

First of all, we need some sounds (samples) to play. As a fan of Sly & The Family Stone, I have predilection for a Maestro Rhythm King:

<iframe width="420" height="315" src="//www.youtube.com/embed/gjFj2mkFYsc" frameborder="0" allowfullscreen></iframe>

In [this page](http://www.submodern.com/slowburn/?p=736) you can download the [samples we use](http://www.submodern.com/slowburn/wp-content/uploads/2007/09/maestrosamples.zip), but we should change format to .wav since .aiff format is not supported by Web Audio API (I used [media.io](http://media.io) to convert those). You can grab the samples converted [here]().

## AudioContext, Buffers and Requests

The first object from Audio API we have to deal with is [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext).  

The process of playing a sample starts with an HttpRequest to the url of the sound, decode with the help of `AudioContext`, and save it into a `Buffer`. Then, play the buffer the times we want. Here is the first attempt:

~~~coffee
# public/beatbox/audio/sampler.js.coffee

context = if window.webkitAudioContext
  new webkitAudioContext()
else
  new AudioContext()

loadSample = (url, callback) ->
  request = new XMLHttpRequest()
  request.open("GET", url, true)
  request.responseType = "arraybuffer"

  request.onload = ->
    context.decodeAudioData request.response, callback, (error)->
      console.error('decodeAudioData error', error)
  request.onerror = ->
    console.error('BufferLoader: XHR error')

  request.send()

playBuffer = (buffer) ->
  source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start(0)

playSample = (url) ->
  loadSample url, (buffer) ->
    playBuffer(buffer)

module.exports = { playSample: playSample }
~~~

The code is simple, but here are some highlights:

- (lines 1- 4) I used the prefixed `webkitAudioContext` if available (instead of standard AudioContext) to make it work in Safari.
- (lines 11-12) After load the `HTTPRequest` I use `context.decodeAudioData` to decode data to a `buffer`.
- (lines 20-23) To play the sound we use a `BufferSource` (line 20). We set the `BufferSource.source` to the decoded `buffer` and `connect` to `context.destination`. The `destination` of the `AudioContext` object is the audio output of the computer.

To check this code, download the [samples](/beatbox-demo/sounds.zip), move them to `public/sounds` and add this line to `app.js.coffee`:

~~~coffee
# public/beatbox/app.js.coffee

...

sampler = require('./audio/sampler.js')
sampler.playSample('/sounds/maeclave.wav')
~~~

As you can see (line 26) we need to wait until the sound is loaded into the buffer. That's why the first time we load the demo the sound may start after a while.

[Demo 3: Play a sample](/beatbox-demo/demo3-play-a-sample/index.html)


## Some abstractions: Sampler and SamplerInstrument

The basic code is what we wrote. But I want to assign a sample to each sequence, so I will introduce a couple of abstractions: `Sampler` will play the sounds based on a name, and `SamplerInstrument` will load a collection of samples and assign it to a name. Let's go:

~~~coffee
# public/beatbox/audio/sampler.js.coffee


class SamplerInstrument
  constructor: (@context, @name, samples) ->
    @buffers = {}
    @_loadSample(name, url) for name, url of samples

  _loadSample: (name, url) ->
    request = new XMLHttpRequest()
    request.open("GET", url, true)
    request.responseType = "arraybuffer"

    request.onload = =>
      @context.decodeAudioData request.response, (buffer) =>
        @buffers[name] = buffer
      , (error)->
        console.error('decodeAudioData error', error)
    request.onerror = ->
      console.error('BufferLoader: XHR error')

    request.send()

class Sampler
  constructor: (@context) ->

  loadInstrument: (name, samples) ->
    @instrument = new SamplerInstrument(@context, name, samples)

  playSample: (name, time) ->
    time = time || 0
    buffer = @instrument.buffers[name] if @instrument
    @_playBuffer(buffer, time) if buffer

  _playBuffer: (buffer, time) ->
    source = @context.createBufferSource()
    source.buffer = buffer
    source.connect(@context.destination)
    source.start(time)


module.exports = Sampler

~~~

That was more or less the same code as above, but we move the loading responsability inside SamplerInstrument, and the playing responsability inside Sampler. Also notice we move the creation of the AudioContext outside this module (as we'll need to share it with the sequencer).

The last change was add `time` parameter to `playSample` method. In WebAudio API time is always relative to the moment we created the AudioContext object, and is expressed in seconds. If time is less than the currentTime of audioConext, the sample will be played at currentTime (thats why `source.start(0)` its the idiomatic way to say: play source now)

Another thing, related to Coffescript only: if you look at lines 92 and 93 I use `=>` operator instead of `->`. The first one returns a function binded to `this`. If we use the normal one (`->`) we couldn't use `@context` or `@buffer` inside the method.

Also, I prefix private methods with an underscore (`_loadSample`, `_playBuffer`), but this is only a convention. Nothing prevents to be called outside, but it helps to understand the code.

## UI interaction

The most straightforward way to make a sample sound when user clicks over the sequence name is to add a handleStepClick method inside SequenceComponent class. It means that every instance of SequenceComponent should have access to the sampler (via @props). This has two problems: first, lot of boilerplate code. Second, is not conceptually desirable that Sequences knows anything about Samplers.

A better (and common) approach is pass a handler function from Pattern to Sequence instances this way (in `pattern.react.js.coffee`):

~~~coffee
# public/components/pattern.react.js.coffee
...
PatternComponent = React.createClass
  handleNameClick: (name) ->
    @props.sampler.playSample(name)

  render: ->
    pattern = @props.pattern
    (div {className: 'beatbox-pattern'},
      (Sequence(sequence: sequence, onNameClick: @handleNameClick) for sequence in pattern.sequences)
    )
~~~

The same way we attach handlers to normal HTML elements, we attach a handler to a Sequence component. We expect the component to give us the sequence name.

Finally, we add bind the handler to the event in Sequence component:

~~~coffee
# public/components/sequence.react.js.coffee
...
SequenceComponent = React.createClass
  ...
  handleNameClick: (e) ->
    e.preventDefault()
    sampleName = e.target.text
    @props.onNameClick(sampleName)

  render: ->
    ...
      (a {className: 'name', href: '#', onClick: @handleNameClick}, sequence.name)
~~~

Try to click over the sequence names:

[Demo 4: Play samples](/beatbox-demo/demo4-play-samples/index.html)

You are ready to finish the drum machine: [Beatbox 4: Time is on my side](/2014/11/07/beatbox4-time-is-on-my-side)

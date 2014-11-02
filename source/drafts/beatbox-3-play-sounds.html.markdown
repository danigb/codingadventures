---
title: 'Beatbox 3: play sounds'
# date: TBD When publishing
tags: tutorial, web audio api, coffeescript
---

# Beatbox 3: play sounds

In [the second part](/2014/11/02/beatbox-2-create-the-user-interface-with-react-js.html) of this tutorial we built the user interface for our drum machine. Now we are going to learn how to play sounds using the Web Audio API.

If you look at the [user interface demo](), at the left of the sequence steps there is a link with the name of the instrument. The goal of this part is play the sound then the user clicks the name. Let's go!

# Load sounds

First of all, we need some sounds (samples) to play. As a fan of Sly & The Family Stone, I have predilection for a Maestro Rhythm King:

<iframe width="420" height="315" src="//www.youtube.com/embed/gjFj2mkFYsc" frameborder="0" allowfullscreen></iframe>

In [this page](http://www.submodern.com/slowburn/?p=736) you can download the [samples we use](http://www.submodern.com/slowburn/wp-content/uploads/2007/09/maestrosamples.zip), but we should change format to .wav since .aiff format is not supported by Web Audio API (I used [media.io](http://media.io) to convert those). You can grab the samples converted [here]().

## AudioContext, Buffers and Requests

The first object from Audio API we have to deal with is [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext).  

The process of playing a sample starts with an HttpRequest to the url of the sound, decode with the help of `AudioContext`, and save it into a `Buffer`. Then, play the buffer the times we want. Here is the first attempt (`public/beatbox/audio/sampler.js.coffee`):

~~~coffee
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

To check this code, download the [samples], move them to `public/sounds` and add this line to `app.js.coffee`:

~~~coffee
sampler = require('./audio/sampler.js')
sampler.playSample('/sounds/maeclave.wav')
~~~

As you can see (line 26) we need to wait until the sound is loaded into the buffer. That's why the first time we load the demo the sound may start after a while.

[Demo 5: Play a sample](/beatbox-demo/play-sample/index.html)


## Some abstractions: Sampler and SamplerInstrument

The basic code is what we wrote. But I want to assign a sample to each sequence, so I will introduce a couple of abstractions: `Sampler` will play the sounds based on a name, and `SamplerInstrument` will load a collection of samples and assign it to a name. Let's go (`public/beatbox/audio/sampler.js.coffee`):

~~~coffee
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

  playSample: (name) ->
    buffer = @instrument.buffers[name] if @instrument
    @_playBuffer(buffer) if buffer

  _playBuffer: (buffer) ->
    source = @context.createBufferSource()
    source.buffer = buffer
    source.connect(@context.destination)
    source.start(0)

module.exports = Sampler
~~~


# Let's play some sounds.

Samples here: http://www.submodern.com/slowburn/?p=736

~~~coffeescript
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
- webkit prefix
- audio decoding
- context.destination

and wire `app.js.coffee`
~~~coffeescript
Sampler = require './audio/sampler.js'
Sampler.playSample('/sounds/ohat.wav')
~~~

## Batch loading
I want to batch load my samples in this way:

~~~coffeescript
samples = {}
for name in ['snare', 'kick', 'hat1', 'hat2', 'clave', 'bongo']
  samples[name] = "/sounds/mae#{name}.wav"

Sampler.init context, samples, ->
  console.log("Sampler!")
  Sampler.playSample('snare')
~~~

So here is the updated `public/beatbox/audio/sampler.js.coffee` module:
~~~coffeescript
context = null

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

playBuffer = (buffer, time) ->
  time ?= context.currentTime
  source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start(0)

buffers = {}
init = (audioContext, sampleURLs, success) ->
  context = audioContext
  loadCount = Object.keys(sampleURLs).length
  for name, url of sampleURLs
    do (name) ->
      loadSample url, (buffer) ->
        buffers[name] = buffer
        success() if --loadCount == 0

playSample = (name, time) ->
  buffer = buffers[name]
  playBuffer(buffer, time) if buffer

module.exports =
  init: init
  playSample: playSample
~~~

We will want to assign a sample to a track, so I write encapsulate a Sample.
I change the `init` method of `sampler.js.coffee`:
~~~coffeescript
context = null

loadSample = (url, callback) ->
  ...

playBuffer = (buffer, time) ->
  ...

class Sample
  constructor: (@name, @buffer) ->
  play: (time) -> playBuffer(@buffer, time) if @buffer

samples = {}
init = (audioContext, sampleURLs, success) ->
  context = audioContext
  loadCount = Object.keys(sampleURLs).length
  for name, url of sampleURLs
    do (name) ->
      samples[name] = new Sample(name)
      loadSample url, (buffer) ->
        samples[name].buffer = buffer
        success(samples) if --loadCount == 0
  samples

playSample = (name, time) ->
  samples[name].play(time)

module.exports =
  init: init
  playSample: playSample

~~~


## More UI Interaction

Let's make when the user click over the track header, the sample is played.
We change our Track react component:
~~~coffeescript
TrackComponent = React.createClass
  ...
  handleTrackClick: (e) ->
    @props.track.sample.play()

  render: ->
    ...
    (a {className: 'head', href: '#', onClick: @handleTrackClick}, track.name)
~~~

We wire the samples with the tracks in `app.js.coffee`

~~~coffeescript
samples = Sampler.init(context, names)
for track in pattern.tracks
  track.sample = samples[track.name]
~~~

Voliá, click the track headers.

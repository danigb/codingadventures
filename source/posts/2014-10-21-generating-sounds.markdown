---
title: "Overtone Day 3: Generating sounds"
date: 2014-10-21
tags: clojure, overtone, sound, synth
---

![Sound Effects in TV history](https://farm1.staticflickr.com/169/427116220_330c3b50cc_z.jpg?zz=1)

Today I will try to learn how can I use Overtone to synthesize new sounds. Maybe
its a goot time to take a look (and print!) the [Overtone cheatsheet](https://github.com/overtone/overtone/raw/master/docs/cheatsheet/overtone-cheat-sheet.pdf)

READMORE

## Hear an example

Ok, let's create new file in our `livecoding` project:
`src/livecoding/generating_sounds.clj` and add a namespace:

~~~ clojure
(ns overtur.es.generating-sound
  (:use overtone.live))
~~~

The flight plan is take one [example](https://github.com/overtone/overtone/tree/master/src/overtone/examples)
 from Overtone repository and try to understand it:

~~~ clojure
(demo 7 (lpf (mix (saw [50 (line 100 1600 5) 101 100.5]))
                  (lin-lin (lf-tri (line 2 20 5)) -1 1 400 4000)))
~~~

Press `Cmd+Shift+Enter` to execute all the code and hear the sound. Cool.

Let's use Light Table's document browser (`Ctrl+Shift+D`) to see what `demo`
method does:

> Listen to an anonymous synth definition for a fixed period of time.
>  Useful for experimentation.  If the root node is not an out ugen, then
>  it will add one automatically.  You can specify a timeout in seconds
>  as the first argument otherwise it defaults to *demo-time* ms.

The simplest use case:

~~~ clojure
(demo 2 (sin-osc 440))
~~~

## Let's `saw`

We are going to disect the example. We focus in the `saw` method, here the docs:

> saw: band limited sawtooth wave generator
>   freq - Frequency in Hertz (control rate).


~~~ clojure
(demo 1 (saw [50]))
(demo 1 (saw [50 100 200]))
(demo 2 (saw [50 101 100.5]))
~~~

The important thing here to notice is that `saw` method generate one saw sound
*for each* `freq` value in the arguments. Also, each sound is played either at
left or right speaker.


## Lines

> line([start end dur action])
> Generates a line from the start value to the end value.
>  start  - Starting value
>  end    - Ending value
>  dur    - Duration in seconds
>  action - A done action to be evaluated when the
>           line is completed. Default: NO-ACTION

~~~ clojure
(line 100 1600 5)         # => #<sc-ugen: line:ar [0]>
(first (line 100 1600 5)) # => [:id 765]
(nth (line 100 1600 5) 2) # => java.lang.UnsupportedOperationException: nth not supported on this type: SCUGen
~~~

Ok, it seems that lines *are not* sequences. Let's try to find more information
about `sc-ugen`. I can't find anything in the documentation browser, so I take
a look to the source code `src/overtone/sc/machinery/ugen/sc_ugen.clj` but
nothing usefull here.

I think we should move to Super Collider's [UGen documentation](http://doc.sccode.org/Classes/UGen.html):

> Unit Generators: represent calculations with signals. They are the basic building blocks of synth definitions on the server, and are used to generate or process both audio and control signals. The many subclasses of UGen are the client-side representations of unit generators, and are used to specify their parameters when constructing synth definitions

I found more information in the [SuperCollider Guides about Ugen and Synths](http://doc.sccode.org/Guides/UGens-and-Synths.html)

> A unit generator is an object that processes or generates sound. There are many classes of unit generators, all of which derive from the class UGen.

We can read "SuperCollider has over 250 unit generators" at [Tour of UGens](http://doc.sccode.org/Guides/Tour_of_UGens.html) SuperCollider guides.

Finally, I arrived at [`Line` docs](http://doc.sccode.org/Classes/Line.html):

> Generates a line from the start value to the end value

We'll. Not very helpful, but lets try to hear it:

~~~ clojure
(demo 5 (saw [(line 100 1600 5)]))  # => #<synth-node[loading]: overtur.es.gef03/audition-synth 631>
~~~

So, finally we can hear what the example does:

~~~ clojure
(demo 5 (saw [50 (line 100 1600 5) 101 100.5]))  # => #<synth-node[loading]: overtur.es.gef03/audition-synth 631>
~~~

## Mix and doc

Let's move on `mix` method. Unfortunately Light Table's documentation browser
not always work. Clojure to the rescue: `(doc mix)` shows the documentation of
the `mix` method *at the console*:

> [ins []]
>
>  ins - List of input channels to mix
>
>  Mix the list of input channels by summing them together
> and dividing by the number of input signals.

Let's hear de difference:

~~~ clojure
;; Without mix
(demo 7 (saw [50 (line 100 1600 5) 101 100.5]))
;; With mix
(demo 7 (mix (saw [50 (line 100 1600 5) 101 100.5])))
~~~

`Mix` just *mix* all the channels into the center (same content left and right),
 but in our example the change is dramatic.

## Linear ranges and more oscillators

Ok, let's try to understand last part of example. `(doc lf-tri)` gives:

> lf-tri: triangle oscillator [freq iphase]

Let's try to hear it:

~~~ clojure
(demo 5 (saw (lf-tri (line 200 400 5)))) # => #<synth-node[loading]: overtur.es.gef03/audition-synth ...
~~~

If we take a look to the console, we can see:

> livecoding 0.1.0-SNAPSHOT[stdout]: TOO LOUD!! (clipped) Bus: 0 - lower master vol

`lin-lin` to the rescue:

> lin-lin: Map values from one linear range to another

So we map the lf-tri from `-1 -> 1` to and audible `400 -> 4000`

~~~ clojure
(demo 5 (saw (lin-lin (lf-tri (line 2 20 5)) -1 1 400 4000)))
~~~

So, finally all the pieces matches:

~~~ clojure
(demo 7 (lpf (mix (saw [50 (line 100 1600 5) 101 100.5]))
                  (lin-lin (lf-tri (line 2 20 5)) -1 1 400 4000)))
~~~

## Follow the mouse

Let's take a look at `src/overtone/examples/getting_started/basic.clj`:

~~~ clojure
(demo 10 (bpf (* [0.5 0.5] (pink-noise))))
(demo 10 (lpf (pink-noise) (lin-lin (lf-tri (line 2 20 5)) -1 1 400 4000)))
~~~

And a more expectacular one:

~~~ clojure
(demo 10
  (rlpf (* 0.5 (saw [338 440]))
  (mouse-x 10 10000)
  (mouse-y 0.0001 0.9999)))
~~~

## What I learned

- How powerful Overtone is: use generators(`saw`, `sin-osc`, `lf-tri`, `pink-noise`),
modulate them with oscillators with the help of `lin-lin`, or transform them
(`mix`, `lpf`)
- Use mouse as input: `mouse-x`, `mouse-y`
- Coljure built-in `doc` method

## Last but not least

~~~ clojure
(source demo)
~~~

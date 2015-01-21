---
title: "Overtone Day 2: Playing Scales"
date: 2014-10-15
tags: clojure, light table, overtone, music theory, scales
---

Today I want to learn how to play a sequence of notes with
Overtone. Not so easy if, like me, you are new to Overtone and Clojure.

READMORE

To learn the basics of  Clojure you can follow the excellent
[swannodette Clojure-LightTable tutorial](https://github.com/swannodette/lt-cljs-tutorial)

I assume some music theory background, but I think you can go without it. Let's go.

## Playing the piano

In the [first post]() we created a simple Clojure project called `livecoding`.
We are going to add a new file into the `src/livecoding` folder called
`play-scales.clj` with the following declaration:

~~~ clojure
(ns overtur.es.play-scales
  (:use overtone.live
        overtone.inst.sampled-piano))
~~~

Basically we define a namespace (`ns`) in which we are going to use two modules:
`overtone.live` and `overtone.inst.sampled-piano`.

Theres a Light Table short-cut to evaluate entire file: `Cmd-Shift-Enter`.

We can play a piano note:

~~~ clojure
(sampled-piano 60 0.5)      => #<synth-node[loading]: overtone.inst.973/sampled-piano 87>
~~~

60 is the note number and 0.5 the amplitude (0 no sound, 1 maximum volume).
What 60 means?:

~~~ clojure
(find-note-name 60)         => :C4
~~~

Ok, lets create a new method:

~~~ clojure
(defn piano [note] (sampled-piano note 0.2))
(piano 58)
~~~

The syntaxis is pretty straightforward: `(defn method-name [arg1 arg2...] (body))`

## Scales and sequences

Ok, lets play with some scales:

~~~ clojure
(scale :G3 :major)          => (55 57 59 60 62 64 66 67)
(first (scale :G3 :major))  => 55
(next (scale :G3 :major))   => (57 59 60 62 64 66 67)
(nth (scale :G3 :major) 2)  => 59
~~~

The Overtone method `scale` return a Clojure sequence. `first` and `next` methods
are the foundation of working with list in functional programming.

Let's try to play a scale:

~~~ clojure
; there's no harm in trying
(piano (scale :G3 :minor))  => java.lang.IllegalArgumentException
~~~

Ok, not so easy.

## Time its on my side

We are going to use the Overtone's `at` method to schedule notes in time:

~~~ clojure
;; Play last note 2secs after invocation
(at (+ 2000 (now)) (piano (note :A6)))    => #<synth-node[loading]: overtone.inst.973/sampled-piano 96>
~~~

The syntax is `at time method` where `(+ 2000 (now))` means: call method `now` and
add 2000 to it. By the way, the `at` method is the 'Ahead-of-time function scheduler'
**aka** [at-at](https://github.com/overtone/at-at)

## Brute force

With `at` we can write the first version of our player:

~~~ clojure
;; Play some notes, brute force
(defn play1
  [notes]
  (piano (first notes))
  (at (+ 1000 (now)) (piano (nth notes 1)))
  (at (+ 2000 (now)) (piano (nth notes 2)))
  (at (+ 3000 (now)) (piano (nth notes 3))))    => #'overtur.es.play-scales/play1

(play1 (scale :G3 :major))    => #<synth-node[loading]: overtone.inst.973/sampled-piano 100>
~~~

## Functional tools

Let's try some functional tricks:

~~~ clojure
;; Nice cluster ;-)
(map (defn play-note [note]
        (at (+ 1000 (now)) (piano note))) (scale :C2 :aeolian))
~~~

We define a new method (`play-note`) and `map` the scale against it. This is
so common that Clojure provides a shorter syntax with an anonymous function
and `%` working as parameter:


~~~ clojure
;; Same as above
(map #(at (+ 1000 (now)) (piano %)) (scale :C2 :aeolian))
~~~


## Let's try recursion

It seems that recursion is the core of Clojure. We can read at
[clojure-doc.org](http://clojure-doc.org) the documentation of
the [`recur`](http://clojure-doc.org/articles/language/core_overview.html#looping) method:

> `recur` allows for self-recursion without consuming stack space proportional to
> the number of recursive calls made. Due to the jack of tail-call optimization
> on the JVM currently, this is the only method of recursion that does not consume excess stack space.

Let's try with it:

~~~ clojure
(defn play-recur
  [time notes]
  (when (first notes)
    (at time (piano (first notes)))
    (recur (+ 300 time) (rest notes))))   => #'overtur.es.play-scales/play-recur

(play-recur (now) (scale :A3 :locrian))   => nil
~~~

Yeah! Note: we use `when` because evaluate multiple expressions in order (first
we play the first note and then we recur).

Lets try with `loop`:

~~~ clojure
(defn play-with-loop
  [notes]
  (loop [t (now)
         f (first notes)
         r (rest notes)]
    (when f
      (at t (piano f))
      (recur (+ 300 t) (first r) (rest r)))))   => #'overtur.es.play-scales/play-with-loop

(play-with-loop (scale :D2 :egyptian))          => nil
~~~

## Let's have some fun

We can use the [built-in scales](https://github.com/overtone/overtone/blob/master/src/overtone/music/pitch.clj):

~~~ clojure
(play-recur (now) (scale :B2 :hex-aeolian))
(play-recur (now) (scale :B2 :messiaen7 (range 1 16)))
(play-recur (now) (reverse (scale :B2 :neapolitan-major (range 1 16))))
(play-recur (now) (shuffle (scale :B2 :kumoi (range 1 16))))
~~~

Simple cannon:

~~~ clojure
(let [t (now)]
  (play-recur t (shuffle (scale :B2 :bartok (range 1 16))))
  (play-recur (+ t 100) (shuffle (scale :B2 :bartok (range 1 16)))))
~~~

Octaves using map and anonymous function:

~~~ clojure
(let [t (now)
      s (scale :B2 :messiaen2)]
  (play-recur t s)
  (play-recur t (map (#(+ 24 %)) s)))
~~~

And some other stuff:

~~~ clojure
(defn seqgen
  [root scale-name]
  (take 32 (cycle (shuffle (scale root scale-name (range 3 8))))))

(let [t (now)
      seq1 (seqgen :B2, :messiaen5)]
  (play-recur t seq1)
  (play-recur (+ t 750) (map #(+ 24 %) seq1)))
~~~

### What I learned

- Create scales and working with sequences (`first`, `rest`)
- Use `at` to schedule
- Create anonymous functions: `fn[n] (+ 24 n)` and `#(+ 24 %)`
- Use recursion with `recur` and `loop`/`recur`
- Use `let` to bind parameters
- Nice Clojure methods: `shuffle`, `cycle`, `take`, `range`

## Extra: Browse documentation with Light Table

Light Table has a built-in documentation browser. Just press `Ctrl+Shift+D` and
search for a method name. This is an excerpt from the documentation of the
 `at` method:

> Schedule server communication - specify that communication messages
>   execute on the server at a specific time in the future

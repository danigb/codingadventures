---
title: Overtone and Light Table setup
date: 2014-10-14
tags: overtone, light table, setup, clojure, leiningen
---

# Setup: Overtone and Light Table

Overtone is an awesome music library built over SuperColider with Clojure. We
want to use the live features and sice I don't know emacs, I will give Light
Table a try.

## Install jdk

In the latest OSX version (Yosemite) Java is not included. As the time I write
this, the first compatible version is
[Java 8 update 25](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

## Install Clojure

We're going to use Overtone with Light Table. Let's install Clojure via
[leiningen](https://github.com/technomancy/leiningen) using the terminal (MacOSX):

~~~
$ wget https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein
$ mv lein /usr/local/bin
$ chmod +x /usr/local/bin/lein
$ lein --version
~~~

If everything is ok, you should see:

~~~
Leiningen 2.5.0 on Java 1.6.0_65 Java HotSpot(TM) 64-Bit Server VM
~~~

## Install Overtone

Then create a Overtone project and let Leiningen install the dependencies:

~~~
$ lein new livecoding
$ cd livecoding
# edit project.clj and add [overtone "0.9.1"] as dependency
$ lein repl
~~~

After some downloads, you should see ´user=>´ from the clojure interactive
environment. In case of doubt, my `project.clj` is this one:

~~~  
(defproject livecoding "0.1.0"
  :description "Live coding setup with Overtone"
  :url "http://overtur.es/2014/10/14/setup"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [
                 [org.clojure/clojure "1.6.0"]
                 [overtone "0.9.1"]])
~~~

Next, download the Light Table binary from the [home page](http://lighttable.com/)
and move the LightTable.app to the Applications folder and the ´light´ script
to a folder inside the executable PATH (tip: drop a file from the finder to
the console to obtain the full path):

~~~
  $ mv /Users/Dani/Downloads/Light Table/light /usr/local/bin
~~~

We're test our setup opening a file with the light script:

~~~
# inside livecoding folder...
$ touch src/livecoding/test_setup.clj
$ light src/livecoding/test_setup.clj
~~~

And finally, our first clojure-overtone code! Type:

~~~ clojure
(ns overtur.examples.test-setup
  (:use [overtone.live]))
(def sin-synth (synth (out 0 (pan2 (sin-osc 440)))))
(sin-synth)
(stop)
~~~

We are going to try the live part of Light Table. Move to the first line
and type `Cmd+Space`, a `nil` should appear next to it. Repeat the same key
combination over the thirth and fourth line. If you can hear a sound, you
just end this setup.

Last but not least, in next posts we are going to use a sampled piano.
The initial download is quite long, so maybe is a good idea to do it now:

~~~
(ns overtone.examples.getting-started.video
  (:use [overtone.live]
  [overtone.inst.sampled-piano]))

(sampled-piano)
~~~

Run the first line (with `Cmd+Space`) and listen. Not very exciting but the
foundation of our explorarion. By the way, this is the simplest way to call a
funcion in clujure: `(method-name arg1 arg2 arg3 ...)`

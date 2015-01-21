---
:title: 'Beatbox: build a rhythm machine with react & WebAudio API'
:tags: tutorial, web audio api, react, coffeescript
:date: 2014-10-31
---

Encouraged by my first steps with Clojure and how popular React.js is within its community (via [om](https://github.com/swannodette/om)), I launched my first experiment: build a simple drum machine using WebAudio API and [CoffeeScript](http://coffeescript.org).

READMORE

In this first part we'll setup the project using node, write a minimal web server that to serve static assets and a script (using [gulp](http://gulpjs.com/)) to convert coffescript to javascript and build a single file from all the sources.

In the second part ([Part 2 here](/2014-11-02-2014-11-02-beatbox2-create-the-user-interface-with-react-js)) we'll use react.js to create the user interface. In the third ([Part 3 here](/2014-11-05-2014-11-05-beatbox3-play-sounds)) we'll learn how to use the WebAudio API to load and play sounds. And in the fourth ([Part 4 here](/2014-11-07-2014-11-07-beatbox4-time-is-on-my-side)) we'll see how to schedule events and beat the machine. Let's go!

### Prerequisites

A part from the standard technologies (html, javascript, css), some [coffeescript](http://coffeescript.org/) knowledge is desirable. Also I assume you have `node` and `npm` installed. If it is not the case, take a look here: [https://github.com/npm/npm](https://github.com/npm/npm)

Some love to rhythm machines will help ;-)

## Create an javascript project

So, let's create the directory structure and (though this is optional) initialize our git repository locally using a predefined `.gitignore`:

~~~bash
$ mkdir beatbox
$ cd beatbox
$ git init .
$ wget https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore -O .gitignore
~~~

We use `npm` to `init` the project:

~~~ bash
$ npm init
~~~

`npm init` will ask us some questions, and the result will be a `package.json` file with all the information. You can change this later, so don't worry if you don't know the license or the repository path.

## Development server

The first thing will be write a simple development server using the popular 'express' library:

~~~javascript
// ./server.js

var fs = require('fs');
var path = require('path');
var express = require('express');

app = express();
app.use(express.static(__dirname + '/public'))

app.listen(3000);
console.log('Server started: http://localhost:3000/');
~~~

Then, create the folder structure...

~~~
$ mkdir public
$ mkdir public/javascripts
$ mkdir public/stylesheets
~~~

... add some html (I skip the css, you can grab it from the [tutorial's repository]()):

~~~html
<!-- ./public/index.html -->

<!DOCTYPE html>
<html lang="en">
<html>
  <head>
    <meta charset="utf-8">
    <title>Beatbox : React drum machine</title>
    <link rel="stylesheet" href="/stylesheets/beatbox.css" />
  </head>
  <body>
    <article>
      <h1>Beatbox</h1>
      <div id="beatbox">
        loading...
      </div>
    </article>
  </body>
  <script src="http://fb.me/react-0.12.0.js"></script>
  <script src="/javascripts/beatbox.js"></script>
</html>
~~~

We could used npm to download react source file and `include` in our `beatbox.js` file, but as you can see I prefer to use different sources for each, at least for development. That's because sometimes I want to debug my code and I don't want to look thousands of lines  to reach what I'm looking for. Also, it's a good way to know how big your code is without dependencies.

Also notice I'm using the development version of the code (instead of `react-0.12.0.min.js`) because it logs more warnings and errors to the console.

Let's try to start the server:

~~~bash
$ npm start
~~~

Oops, `Error: Cannot find module 'express'`, let's solve it:

~~~bash
$ npm install --save-dev express
~~~

I use the '--save-dev' modifier (instead of '--save') to add `express` inside `package.json` as development dependency.

If everything it's all right, you should see 'loading...' at
[http://localhost:3000](http://localhost:3000)

## Build the javascript

I know [grunt](gruntjs.com) is the most popular task runner, but I prefer [gulp](gulpjs.com) because the configuration files are smaller and simpler.

Our gulp file will be this one:

~~~javascript
// ./gulpfile.js

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var watchify = require('watchify');
var plumber = require('gulp-plumber');
var duration = require('gulp-duration')

function buildScript() {
  gulp.src('./client/app.js.coffee', { read: false })
    .pipe(plumber())
    .pipe(browserify({ transform: ['coffeeify'], extensions: ['.coffee'] }))
    .pipe(concat('beatbox.js'))
    .pipe(duration('Building script'))
    .pipe(gulp.dest('./public/javascripts'));
}

gulp.task('default', function() {
  buildScript();
  gulp.watch('./client/**/*.coffee', function() {
      buildScript();
    })
});
~~~

The hardest part is handled by [browserify](http://browserify.org/) (via `gulp-browserify` module). Browserify let us declare the source dependencies using the popular `require` syntax. It also translates the code from coffeescript to javascript (`transform: ['coffeeify']`).

The rest of the file is quite straightforward: we use `watchify` to detect source changes, and rebuild the final script when required. `gulp-plumber` prevents that syntax errors stops our watcher, and `concat`, `duration` and `gulp.dest` does ... what it says.

We need to install some dev-dependencies:

~~~bash
$ npm install --save-dev gulp gulp-browserify coffeeify gulp-concat watchify gulp-plumber gulp-duration
~~~

To build (and rebuild when required) our javascript we will use the `gulp` command. Let's add some modules first.


## Test our build stream

We'll add a couple of modules to test our setup. The first one `./client/app.js.coffee` is the app entry point because is the one we referenced at our `gulpfile.js`:

~~~coffeescript
# ./client/app.js.coffee

Beatbox = require './beatbox.js'

window.onload = ->
  div = document.getElementById('beatbox')
  div.innerHTML = "Beatbox version #{Beatbox.VERSION}"
~~~

Let's define the required module:

~~~coffeescript
# ./client/beatbox.js.coffee

Beatbox =
  VERSION: "0.1.0"

module.exports = Beatbox
~~~

Notice that we 'require' the second module from the first, but using `.js` instead of `.js.coffee`.

A common mistake (at least for me) is forget the `module.exports` declaration. First thing to check when you have strange exceptions at runtime.

Ok, let's build our file:

~~~bash
$ gulp
~~~

If you reload the browser and see 'Beatbox version 0.1.1' then you are ready to [Beatbox 2: Create the user interface with react.js](/2014-11-02-2014-11-02-beatbox2-create-the-user-interface-with-react-js). Move on!

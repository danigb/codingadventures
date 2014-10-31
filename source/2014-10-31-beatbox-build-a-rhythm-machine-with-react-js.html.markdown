---
:title: 'Beatbox: build a rhythm machine with WebAudio API and React.js'
:tags: tutorial, web audio api, react, coffeescript
:date: 2014-10-31
---
# Beatbox: build a rhythm machine with WebAudio API and React.js

Encouraged by my first steps with Clojure and how popular React.js is within its
community (via [om](https://github.com/swannodette/om)), I launched my first
experiment: build a simple drum machine using WebAudio API and
[CoffeeScript](http://coffeescript.org).

In this first part we'll setup the project using node, and build a simple
server with express and browserify.

In the second part ([Part 2 here](/)) we'll use react.js to create the user
interface. In the third ([Part 3 here]()) we'll learn how to use the WebAudio
API to load and play sounds. And in the fourth ([Part 4 here]()) we'll
see how to schedule events and beat the machine. Let's go!

## Create the project and add dependencies

I assume you have `node` and `npm` installed. If it is not the case,
take a look here: [https://github.com/npm/npm](https://github.com/npm/npm)

So, let's create the directory structure and (though this is optional)
initialize our git repository locally using a predefined `.gitignore`:

~~~bash
mkdir beatbox
cd beatbox
mkdir public
git init .
wget https://raw2.github.com/github/gitignore/master/Node.gitignore -O .gitignore
~~~

We use `npm` to `init` the project and `install` the required libraries:

~~~ bash
npm init
npm install --save react@0.12.0-rc1
npm install --save express ejs
npm install --save-dev browserify watchify nodemon
npm install --save-dev panel-static
~~~

`npm init` will ask us some questions.
Take note of the `--save` and `--save-dev` modifiers when installing the
libraries.

Browserify allows us to split the application in modules and declare their
dependencies using the popular CommonJS syntax: `require` and `module.exports`

Unfortunately it doesn't work with Coffescript, so `panel-static` to the rescue.

## Development server

In `./server.js` we define our small development server (express and
  panel-static do all the hard work):

~~~javascript
var fs = require('fs');
var path = require('path');
var express = require('express');
var panelStatic = require('panel-static')

app = express();
app.use(panelStatic(path.join(__dirname, 'public')));

app.listen(4567);
console.log('Server started: http://localhost:4567/');
~~~

Add a `/public/index.html` file:

~~~html
<!DOCTYPE html>
<html lang="en">
<html>
  <head>
    <meta charset="utf-8">
    <title>Beatbox : Simple drum machine</title>
    <link rel="stylesheet" href="/css/base.css" />
  </head>
  <body>
    <article>
      <h1>Beatbox</h1>
      <div id="beatbox">
        loading...
      </div>
    </article>
  </body>
  <script src="/js/app.js.coffee"></script>
</html>
~~~

And start the server:

~~~bash
npm start
~~~

If everything it's all right, we should see 'loading...' at
[http://localhost:4567](http://localhost:4567)

##Test browserify and coffeescript

We'll add a couple of modules to test browserify. The first one
`./public/js/app.js.coffee` is the app entry point (because is the one we
referenced at `index.html`)

~~~coffeescript
Beatbox = require './beatbox.js'

window.onload = ->
  document.getElementById('beatbox').innerHTML = Beatbox.hello()
~~~

We use the `hello` method from the Beatbox module. Take care with file
extensions: `require` works after coffeescript compilation. The Beatbox
module lives here `public/js/beatbox.js.coffee`:

~~~coffeescript
Beatbox =
  hello: -> 'Hello from beatbox!'

module.exports = Beatbox
~~~

A common mistake (at least for me) is to forget the `module.exports`
declaration. First thing to check when you have strange exceptions at runtime.

If you reload the browser and see 'Hello from beatbox!' then you are ready to
[Beatbox 2: Create the user interface with react.js](). Move on!

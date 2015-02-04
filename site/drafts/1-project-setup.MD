**Beatbox**: a simple drum machine using WebAudio API and react.js
# Part 1: Setup

~~~ bash
git init .
wget https://raw2.github.com/github/gitignore/master/Node.gitignore -O .gitignore
~~~

Add dependencies
~~~ bash
npm init
npm install --save express ejs
npm install --save-dev browserify watchify nodemon
npm install --save-dev panel-static
npm install --save react@0.12.0-rc1
~~~

Add simple node webserver `/server.js`:

~~~ javascript
var fs = require('fs');
var path = require('path');
var express = require('express');
var panelStatic = require('panel-static')

app = express();
app.use(panelStatic(path.join(__dirname, 'public')));

app.listen(4567);
console.log('Server started: http://localhost:4567/');
~~~

Add `/public/index.html`:
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
and some css styling.

Add file `public/js/app.js.coffee`:
~~~coffeescript
Beatbox = require './submodule.js'

window.onload = ->
  document.getElementById('beatbox').innerHTML = Beatbox.hello()
~~~

And a submodule `public/js/submodule.js.coffee`:
~~~coffeescript
Beatbox =
  hello: -> 'Hello from submodule!'

module.exports = Beatbox
~~~

Start:
~~~bash
npm start
~~~

Visit localhost:4567 and open the console

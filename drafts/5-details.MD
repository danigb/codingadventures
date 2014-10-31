
## Beats subdivision

~~~coffee
  @secondsPerBeat = (60.0 / @tempo) * (4 / subdivision)
~~~


## Stop event should clear the active column

Dispatcher. Flux architecture. Flux architecture. Meanwhile:

~~~coffee
class Scheduler
  constructor: (@context, tempo, @scheduleBeat) ->
    ...
    @onStop = ->
    @onStart = ->

  start: ->
    ...
    @onStart()
~~~

## Generate production file

~~~
npm install --global gulp
npm install --save-dev gulp
npm install --save-dev gulp-browserify coffeeify gulp-concat watchify
~~~

~~~javascript
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var watchify = require('watchify');

function buildScript() {
  gulp.src('./public/beatbox/app.js.coffee', { read: false })
    .pipe(browserify({ transform: ['coffeeify'], extensions: ['.coffee'] }))
    .pipe(concat('beatbox.js'))
    .pipe(gulp.dest('./build'));
}

gulp.task('default', function() {
  gulp.watch('./public/**/*.coffee', function() {
      console.log ("Building script...")
      buildScript();
    })
  // place code for your default task here
});

gulp.task('build', function() {
  buildScript();
});
~~~

TODO:
- Minimize and compress
- Generate not only javascript
- Move beatbox out of public
- Replace panel with gulp

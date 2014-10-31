---
title: 'Beatbox: build a rhythm machine with WebAudio API and React.js'
# date: TBD When publishing
tags:
---

# Beatbox: build a rhythm machine with WebAudio API and React.js

Animado por mis primeros pasos con Clojure y lo popular que es React.js en esa
comunidad (vía [om](https://github.com/swannodette/om)) me lanzo a mi primer
experimento: crear una caja de ritmos utilizando WebAudio API. El código
lo escribiremos en [Coffeescript](http://coffeescript.org).

En esta primera parte montaremos una pequeña infraestructura para desarrollar
el proyecto, utilizando node, express, browserify y coffeescript.

En la segunda parte ([2ª parte aquí](/)) utilizaremos react.js para crear el interface
de usuario. En la tercera ([3ª parte aquí]()) aprenderemos a utilizar la WebAudio API
para cargar y lanzar sonidos. Y en la cuarta ([4ª parte aquí]()) veremos cómo
lanzar esos sonidos a tiempo. Vámos!

##Crear el proyecto y añadir dependencias

Voy a dar por supuesto que tenemos node instalado y funcionando. Si no es así
podéis mirar aquí:

Vamos a crear la estructura de directorio y (aunque esto es opcional)
inicializaremos nuestro un repositorio git local utilizando un `.gitignore`
predefinido:

~~~bash
mkdir beatbox
cd beatbox
mkdir public
git init .
wget https://raw2.github.com/github/gitignore/master/Node.gitignore -O .gitignore
~~~

Node viene con un estupendo gestor de paquetes: `npm`. Lo vamos a usar para
añadir las dependencias:

~~~ bash
npm init
npm install --save react@0.12.0-rc1
npm install --save express ejs
npm install --save-dev browserify watchify nodemon
npm install --save-dev panel-static

~~~

Después de responder a las preguntas de `npm init` vamos a instalar unas
cuantas librerías. En primer lugar, la última versión de react disponible
en estos momentos. Express y ejs nos permitirán montar un pequeño servidor
web para el desarrollo.
Browserify es una librería que nos permite programar utilizar la sintáxis de
CommonJS para definir módulos y sus dependencias. De esa manera crea un solo
archivo .js para nuestra aplicación.
Y panel-static permite que podamos usar coffeescript con Browserify.

##Servidor de desarrollo

En `./server.js` vamos a definir nuestro pequeño servidor de desarollo:

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

Añadimos una página html `/public/index.html`:

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
        cargando...
      </div>
    </article>
  </body>
  <script src="/js/app.js.coffee"></script>
</html>
~~~

Y encendemos el servidor:

~~~bash
npm start
~~~

Si todo va bien, deberíamos ver 'cargando...' cuando nos conectamos a
[http://localhost:4567](http://localhost:4567)

##Comprobar que browserify funciona

Vamos a hacer una pequeña prueba de que nuestro sistema funciona. Añadimos
un primer módulo `./public/js/app.js.coffee` y que sirve como punto de entrada
(es el que hemos definido en el html):

~~~coffeescript
Beatbox = require './submodule.js'

window.onload = ->
  document.getElementById('beatbox').innerHTML = Beatbox.hello()
~~~

Como véis declara que depende de un submódulo que vamos a escribir en
`./public/js/submodule.js.coffee` (cuidado con las extensiones: cuando
usamos `require` damos por supuesto que el coffeescript ha sido traducido
a javascript):

And a submodule `public/js/submodule.js.coffee`:

~~~coffeescript
Beatbox =
  hello: -> 'Hello from submodule!'

module.exports = Beatbox
~~~

Coffeescript es sensible a la indentación, así que ten cuidado
(si utilizas vim, usa :set paste)

Si todo ha ido bien y al recargar la página ves "Hola desde el submódulo" es
que estás listo/a para pasar a la [segunda parte]()

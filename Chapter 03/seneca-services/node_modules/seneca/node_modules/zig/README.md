Zig - Simple, but naughty, control flow for Node.js
======================================================

> Why have an if statement when you can have an if function?

A special case solution for callback hell that focuses on developer
ease-of-use. Executes your functions in series or parallel, tracks
errors and results, **and provides conditionals**.

Allows you to move blocks of code around to change the order of
execution.


Current Version: 0.1.1

Tested on: Node 0.10.38

[![Build Status](https://travis-ci.org/rjrodger/zig.png?branch=master)](https://travis-ci.org/rjrodger/zig)

[Annotated Source](http://rjrodger.github.io/zig/doc/zig.html)


# Support

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

[![Gitter chat](https://badges.gitter.im/rjrodger/zig.png)](https://gitter.im/rjrodger/zig)


# Install

```sh
npm install zig
```


## Quick Example

Some callbacks:

```js
function color(val,callback) {
  callback(null,{color:val})
}

function quality(val,callback) {
  callback(null,{quality:val})
}

function sound(val,callback) {
  callback(null,{sound:val})
}

function texture(val,callback) {
  callback(null,{texture:val})
}
```


Nice and linear down the page.

```js
var zig = require('..')

var result = {}

zig()
  .start()

  .wait(function(data,done){
    color('red',done)
  })
  .step(function(data){
    console.log('color:'+data.color)
    return result.color = data.color
  })

  .wait(function(data,done){
    quality('high',done)
  })
  .step(function(data){
    console.log('quality:'+data.quality)
    return result.quality = data.quality
  })

  .if( Math.random() < 0.5 )
  .wait(function(data,done){
    sound('violin',done)
  })
  .step(function(data){
    console.log('sound:'+data.sound)
    return result.sound = data.sound
  })
  .endif()

  .wait(function(data,done){
    texture('rough',done)
  })
  .step(function(data){
    console.log('texture:'+data.texture)
    return result.texture = data.texture
  })

  .end(function(err){
    if( err ) return console.log(err)
    console.log(result)
  })
```


Versus callback hell:

```js
var result = {}

color('red', function(err,data){
  if( err ) return console.log(err)

  result.color = data.color
  console.log('color:'+data.color)

  quality('high', function(err,data){
    if( err ) return console.log(err)

    result.quality = data.quality
    console.log('quality:'+data.quality)

    if( Math.random() < 0.5 ) {
      sound('violin',function(err,data){
        if( err ) return console.log(err)

        result.sound = data.sound
        console.log('sound:'+data.sound)
        do_texture()
      })
    }
    else do_texture()

    function do_texture() {
      texture('rough', function(err,data){
        if( err ) return console.log(err)

        result.texture = data.texture
        console.log('texture:'+data.texture)

        console.log(result)
      })
    }
  })
})
```


## Testing

```sh
npm test
```


## Releases

   * 0.1.0: normalize test, build, and readme
   * 0.0.2: steps can exit
   * 0.0.1: first working version





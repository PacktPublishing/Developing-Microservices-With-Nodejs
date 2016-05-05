
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



ziggy()
//callbacks()


function ziggy() {

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
}


function callbacks() {

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
}

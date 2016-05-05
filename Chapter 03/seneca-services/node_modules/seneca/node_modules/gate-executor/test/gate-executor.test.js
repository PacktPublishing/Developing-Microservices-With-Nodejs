/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
"use strict";


// mocha gate-executor.test.js

var util   = require('util')
var assert = require('assert')

var _ = require('lodash')


var executor = require('..')

// timerstub broken on node 0.11
// var timerstub = require('timerstub')

var timerstub = {
  setTimeout:  setTimeout,
  setInterval: setInterval,
  Date:        Date,
  wait: function(dur,fn){
    setTimeout(fn,dur)
  }
}



describe('executor', function(){

  it('happy', function(fin) {
    if( ~process.version.indexOf('0.11.') ) return fin();

    var e0 = executor({
      trace:true,
      timeout:150,
      stubs:timerstub
    })

    var printlog = []
    
    function print(err,out){
      if( err ) return printlog.push('ERROR: '+err)
      printlog.push(''+out)
    }

    function mfn(a,d) {
      var f = function(cb){ 
        timerstub.setTimeout(function(){
          if( 'b'==a ) return cb(new Error('B'));
          cb(null,a)
        },d) 
      }
      return f
    }

    var start = timerstub.Date.now()
    e0.execute({id:'a',fn:mfn('a', 25),  cb:print})
    e0.execute({id:'b',fn:mfn('b', 25),  cb:print})
    e0.execute({id:'c',fn:mfn('cG',50), cb:print,gate:true})
    e0.execute({id:'d',fn:mfn('d', 25),  cb:print})

    timerstub.setTimeout( function(){
      e0.execute({id:'e',fn:mfn('eG', 50), cb:print,gate:true})
      e0.execute({id:'f',fn:mfn('fG', 50), cb:print,gate:true})
      e0.execute({id:'g',fn:mfn('g',  25),  cb:print})
      e0.execute({id:'h',fn:mfn('h',  25),  cb:print})

      e0.execute({id:'i',fn:mfn('i',175),cb:print})
    },100)

    timerstub.setTimeout( function(){
      e0.execute({id:'j',fn:mfn('j',25),cb:print})
      e0.execute({id:'k',fn:mfn('k',25),cb:print})
    },350)


    // hopefully a temporary hack until timerstub works properly with node 0.11
    function fixfuzz(mod,str) {
      str = str.replace(/\d+/g, function(m){ return mod*Math.floor(parseInt(m,10)/mod) })
      //console.log('\nA:'+str)
      str = str.replace(/\d\d\d/g, function(m){ return (2*mod)*Math.ceil(parseInt(m,10)/(mod*2)) })
      //console.log('\nB:'+str)
      str = str.replace(/150/g,'160')
      str = str.replace(/200/g,'210')
      str = str.replace(/350/g,'360')
      return str;
    }


    timerstub.setTimeout( function(){
      //console.log( util.inspect(printlog).replace(/\s+/g,' ') )

      assert.equal("[ 'a', 'ERROR: Error: gate-executor: B',"+
                   " 'cG', 'd', 'eG', 'fG', 'g', 'h',"+
                   " 'ERROR: Error: gate-executor: [TIMEOUT]', 'j', 'k' ]",
                   util.inspect(printlog).replace(/\s+/g,' '))
    },400)

    timerstub.wait(450,fin)
  })


  it('no-callback',function(fin){
    var e1 = executor({
      trace:true,
      timeout:30,
      stubs:timerstub
    })

    var t1 = false
    var start = timerstub.Date.now()
    e1.execute({id:'a',fn:function(done){t1=true;done()}})
    timerstub.wait(90,function(){
      assert.ok(t1)
      fin()
    })
  })


  it('ignore-gate',function(fin){
    var e1 = executor({
      trace:true,
      timeout:20,
      stubs:timerstub
    })

    var seq = ''


    e1.execute({id:'a',fn:function(done){seq+='a';done()}})
    e1.execute({id:'b',gate:true,fn:function(done){
      seq+='b'

      e1.execute({id:'c',ungate:true,fn:function(done2){
        seq+='c'

        done2()
        done()
      }})

      e1.execute({id:'d',gate:true,fn:function(done3){
        seq+='d'
        timerstub.setTimeout(done3,20)
      }})

      
    }})
    e1.execute({id:'e',fn:function(done){seq+='e';done()}})

    timerstub.wait(40,function(){
      //console.log('SEQ '+seq)

      assert.equal('abcde',seq)
      fin()
    })
  })

})

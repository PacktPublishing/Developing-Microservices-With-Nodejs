"use strict";


var zig = require('..')

var assert = require('assert')


describe('zig',function(){

  it('direct', function(fin){
    var tmp = {}

    zig()
      .start(fin)
      .wait(function(args,done){
        setTimeout(function(){
          tmp.a=1
          done(null,{aa:2})
        },10)
      })
      .step(function(data){
        tmp.aa = data.aa
        return { b:3 }
      })
      .wait(function(args,done){
        setTimeout(function(){
          tmp.b=args.b
          done(null,{bb:4})
        },10)
      })
      .step(function(data){
        tmp.bb = data.bb
        return { c:5 }
      })
      .step(function(data){
        tmp.c = data.c
        return { d:6 }
      })
      .end(function(err,out){
        if(err) return fin(err);
        assert.deepEqual({d:6},out)
        assert.deepEqual({a:1,aa:2,b:3,bb:4,c:5},tmp)
        fin()
      })
  })


  it('cond', function(fin){
    var tmp = {}

    zig()
      .start(fin)
      .wait(function(args,done){
        setTimeout(function(){
          tmp.a=1
          done(null,{aa:2})
        },10)
      })
      .step(function(data){
        tmp.aa = data.aa
        return { b:3 }
      })

      .if( '3 == data.b' )
      .wait(function(args,done){
        setTimeout(function(){
          tmp.b=args.b
          done(null,{bb:4})
        },10)
      })
      .step(function(data){
        tmp.bb = data.bb
        return { c:5 }
      })
      .endif()


      .if( function(data){ return 6 == data.c || 0 == tmp.a } )
      .step(function(data){
        tmp.c = data.c
        return { d:6 }
      })

      .if( '5 == data.c' )
      .step(function(data){
        tmp.a = -1
      })
      .endif()

      .endif()


      .if( true )
      .step(function(data){
        return { e:7 }
      })

      .endif()

      .end(function(err,out){
        if(err) return fin(err);
        assert.deepEqual({e:7},out)
        assert.deepEqual({a:1,aa:2,b:3,bb:4},tmp)
        fin()
      })
  })


  it('parallel', function(fin){
    zig()
      .start(fin)
      .run(function(data,done){
        setTimeout(function(){
          done(null,1)
        },10)
      })
      .run(function(data,done){
        setTimeout(function(){
          done(null,2)
        },10)
      })
      .wait(function(args,done){
        done(null,{a:args,b:3})
      })

      .end(function(err,out){
        if(err) return fin(err);
        assert.deepEqual({a:[1,2],b:3},out)
        fin()
      })
  })


  it('timeout', function(fin){
    var tmp = {a:[]}

    zig({timeout:100})
      .start(fin)
      .run(function(data,done){
        setTimeout(function(){
          done(null,1)
        },110)
      })
      .wait(function(args,done){
        done(null,{a:args,b:1})
      })
      .end(function(err,out){
        if(!err) return fin(new Error('no timeout!'));
        assert.equal(err.code,'timeout')
        fin()
      })
  })


  it('exit', function(fin){
    var tmp = {}
    zig({timeout:22222})
      .start()
      .step(function(){ tmp.a = 1; return true})
      .step(function(){ tmp.b = 2; return false})
      .step(function(){ tmp.c = 3; return null})
      .step(function(){ tmp.d = 4; return true})
      .end(function(e,o){
        assert.equal(null,o)
        assert.deepEqual({a:1,b:2,c:3},tmp)
        fin(e)
      })
  })

})

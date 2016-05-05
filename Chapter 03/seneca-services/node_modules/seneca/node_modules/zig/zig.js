/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
"use strict";
/* jshint node:true, asi:true, eqnull:true */


var util = require('util')

var _ = require('lodash')


function Zig( options ) {
  var self = this
  options = options || {}

  var trace = options.trace || function(){}
  trace = (_.isBoolean(trace) && trace) ? function(){
    var args = Array.prototype.slice.apply(arguments)
    args.unshift('zig')
    args = _.map(args,function(a){
      return _.isObject(a) ? util.inspect(a) : a
    })
    console.log(args.join('\t'))
  } : trace

  var errhandler = console.log
  var complete   = console.log
  var ifdepth    = 0

  var steps = []

  function execute() {
    var step,data,dead=false
    var ifdepth = 0, active = true
    var collect = 0, collector = []
    var to

    if( options.timeout ) {
      to = setTimeout(function(){
        dead = true

        // TODO: use eraro
        var err = new Error('TIMEOUT')
        err.code = 'timeout'
        errhandler(err)

      },options.timeout)
    }

    function nextstep() {
      if( dead ) return;

      step = steps.shift()

      if( !step ) return exit();

      step.fn = step.fn || {nm:'---anon---'}
      step.fn.nm = step.fn.nm || step.fn.name

      if( 'step' == step.type && active ) {
        data = step.fn(data)
        trace(step.type,step.fn.nm,data)
        if( null == data ) return exit();
        nextstep()
      } 
      else if( 'run' == step.type && active ) {
        collect++
        step.fn(data,function(err,out){
          if( err ) return errhandler(err);
          collector.push(out)
          check_collect()
        })
        trace(step.type,step.fn.nm,data)
        nextstep()
      }
      else if( 'wait' == step.type && active ) {
        trace(step.type,step.fn.nm,data)
        if( 0 === collect ) return wait_fn();
        check_collect()
      }
      else if( 'if' == step.type ) {
        if( active ) {
          active = evalif(data,step.cond)
          ifdepth++;
        }
        else ifdepth++;

        trace(step.type,step.fn.nm,active,ifdepth)
        nextstep()
      }
      else if( 'endif' == step.type ) {
        ifdepth--;
        ifdepth = ifdepth < 0 ? 0 : ifdepth;
        active = 0 === ifdepth;

        trace(step.type,step.fn.nm,active,ifdepth+1)
        nextstep()
      }
      else nextstep()


      function check_collect() {
        if( dead ) return;
        if( collector.length >= collect ) {
          data = _.clone(collector)
          collect = 0
          collector = []
          wait_fn()
        }
      }

      function wait_fn() {
        step.fn(data,function(err,out){
          if( err ) return errhandler(err);
          data = out
          setImmediate(nextstep)
        })
      }

      function exit() {
        if( 0 < ifdepth ) throw new Error(ifdepth+' missing endifs.')
        clearTimeout(to)
        return complete(null,data);
      }
    }
    nextstep()
  }

  
  function evalif(data,cond) {
    var bool = false

    if( _.isFunction(cond) ) {
      bool = cond(data)
    }
    else if( _.isBoolean(cond) ) {
      bool = cond
    }
    else if( _.isString(cond) ) {
      /* jshint evil:true */
      bool = !!eval(cond)
    }

    return bool
  }


  self.start = function( cb ) {
    errhandler = cb || errhandler
    return self;
  }

  self.end = function( cb ) {
    complete = cb || errhandler
    errhandler = complete
    execute()
  }
  
  self.wait = function( fn ) {
    steps.push({
      type:'wait',
      fn:fn
    })
    return self;
  }

  self.step = function( fn ) {
    steps.push({
      type:'step',
      fn:fn
    })
    return self;
  }

  self.if = function( cond ) {
    steps.push({
      type:'if',
      cond:cond
    })
    return self;
  }

  self.endif = function() {
    steps.push({
      type:'endif'
    })
    return self;
  }

  self.run = function( fn ) {
    steps.push({
      type:'run',
      fn:fn
    })
    return self;
  }

}



module.exports = function(options){
  return new Zig(options)
}

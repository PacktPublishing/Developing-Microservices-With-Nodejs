/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var events = require('events')
var util   = require('util')

var _      = require('lodash')
var async  = require('async')
var error  = require('eraro')({package:'gate-executor'})


util.inherits( GateExecutor, events.EventEmitter )

// Create new GateExecutor
// options:
//    * _timeout_:   take timeout
//    * _trace_:     true => built in tracing, function => custom tracing
//    * _error_:     function for unexpected errors, default: emit: 'error'
//    * _msg_codes_: custom tracing code names
function GateExecutor( options ) {
  var self = this
  events.EventEmitter.call(self)

  options = _.extend({
    timeout: 33333,
    trace:   false,
    stubs:   {Date:{}},

    error: function(err){
      self.emit('error',err)
    },
  },options)

  options.msg_codes = _.extend({
    msg_codes: {
      timeout:   'task-timeout',
      error:     'task-error',
      callback:  'task-callback',
      execute:   'task-execute',
      abandoned: 'task-abandoned'
    }
  },options.msg_codes)


  var set_timeout   = options.stubs.setTimeout   || setTimeout
  var clear_timeout = options.stubs.clearTimeout || clearTimeout
  var now           = options.stubs.Date.now     || Date.now

  var q = async.queue(work,1)

  var gated   = false
  var waiters = []

  var runtrace = !!options.trace
  self.tracelog = runtrace ? (_.isFunction(options.trace) ? null : []) : null

  var tr = !runtrace ? _.noop : 
        (_.isFunction(options.trace) ? options.trace : function() {  
          var args = Array.prototype.slice.call(arguments) 
          args.unshift(now())
          self.tracelog.push( args ) 
        })


  q.drain = function(){
    /* jshint boss:true */

    tr('ungate')
    gated = false

    var task = null
    while( task = waiters.shift() ) {
      work(task,task.cb)
    }
  }


  function work( task, done ) {
    tr('work',task.id,task.desc)

    setImmediate( function(){
      var completed = false
      var timedout  = false

      if( done ) {
        var toref = set_timeout(function(){
          timedout = true
          if( completed ) return;

          tr('timeout',task.id,task.desc)
          task.time.end = now()

          var err = new Error('[TIMEOUT]')
          err.timeout = true

          err = error(err,options.msg_codes.timeout,task)

          done(err);
        },options.timeout)
      }

      task.time = {start:now()}

      try {
        var task_start = Date.now()
        task.fn(function(err,out){
          var args = Array.prototype.slice.call(arguments)

          completed = true
          if( timedout ) return;

          tr('done',task.id,task.desc,Date.now()-task_start)
          task.time.end = now()

          if( toref ) {
            clear_timeout(toref)
          }

          if( err ) {
            args[0] = error(err,options.msg_codes.error,task)
          }

          if( done ) {
            try {
              done.apply(null,args)
            }
            catch(e) {
              options.error(error(e,options.msg_codes.callback,task))
            }
          }
        })
      }
      catch(e) {
        if( toref ) {
          clear_timeout(toref)
        }

        var et = error(e,options.msg_codes.execute,task)
        try {
          done(et)
        }
        catch(e) {
          options.error(et)
          options.error(error(e,options.msg_codes.abandoned,task))
        }
      }
    })
  }


  self.execute = function( task ) {
    if( task.gate ) {
      tr('gate',task.id,task.desc)
      gated = true
      q.push(task, task.cb)
    }
    else if( gated && !task.ungate ) {
      tr('wait',task.id,task.desc)
      waiters.push( task )
    }
    else {
      work( task, task.cb )
    }
  }

  
  return self
}


module.exports = function( options) {
  return new GateExecutor(options)
}


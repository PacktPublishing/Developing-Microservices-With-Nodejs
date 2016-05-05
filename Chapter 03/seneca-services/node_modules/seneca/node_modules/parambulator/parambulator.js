/* Copyright (c) 2012-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */

(function() {
  "use strict";

  var root           = this
  var previous_parambulator = root.parambulator

  var has_require = typeof require !== 'undefined'


  var _      = root._
  var gex    = root.gex
  var jsonic = root.jsonic


  if( typeof _ === 'undefined' ) {
    if( has_require ) {
      _ = require('lodash')
    }

    // assume in web context, so still underscore, not lodash
    else throw new Error('parambulator requires underscore, see http://underscorejs.org');
  }

  if( typeof gex === 'undefined' ) {
    if( has_require ) {
      gex = require('gex')
    }
    else throw new Error('parambulator requires gex, see http://github.com/rjrodger/gex');
  }

  if( typeof jsonic === 'undefined' ) {
    if( has_require ) {
      jsonic = require('jsonic')
    }
    else throw new Error('parambulator requires jsonic, see http://github.com/rjrodger/jsonic');
  }



  var arrayify = function(){ return Array.prototype.slice.call(arguments[0],arguments[1]) }


  var quantrule = function( pass, rulename ) {
    rulename = rulename || 'quantrule'

    return function(ctxt,cb) {
      ctxt.prop = null

      var pn = ctxt.util.proplist(ctxt)

      var found = 0
      _.each(pn, function(p){
        found += ctxt.point[p]?1:0
      })

      if( !pass(found) ) {
        ctxt.value = ''+pn
        return ctxt.util.fail(ctxt,cb)
      }
      else return cb();
    }
  }

  var lenrule = function( pass ) {
    return function(ctxt,cb) {
      var len = ctxt.rule.spec
      var value = ctxt.point

      if( !_.isUndefined(value) ) {
        var valuelen = _.isObject(value) ? Object.keys(value).length : value.length
        if ( !_.isUndefined( valuelen ) ){
          if ( !pass( valuelen, len ) ) {
            return ctxt.util.fail(ctxt,cb)
          }
        }
      }

      return cb()
    }
  };


  var childrule = function( pass, noneok, rulename ) {
    rulename = rulename || 'childrule'

    return function(ctxt,cb) {
      var pn = ctxt.util.proplist(ctxt)

      for( var i = 0; i < pn.length; i++ ) {
        var p = pn[i]
        ctxt.prop = p

        var v = ctxt.point[p]

        if( !pass(ctxt,p,v) ) {
          ctxt.value = v
          return ctxt.util.fail(ctxt,cb)
        }
      }

      if( 0 === pn.length ) {
        if( !noneok() ) {
          // TODO needs a separate msg code
          ctxt.prop = JSON.stringify(ctxt.rule.spec,killcircles())
          return ctxt.util.fail(ctxt,cb)
        }
      }
      cb();
    }
  }

  function proplist(ctxt) {
    var pn = ctxt.rule.spec

    // TODO: handle comma separated strings
    // https://github.com/rjrodger/parambulator/issues/19

    if( !_.isArray(pn) ) {
      pn = [''+pn]
    }

    var all = []
    _.each(pn, function(n){

      if( n.match( /[*?]/ ) ) {
        all = all.concat( _.keys(gex(n).on(ctxt.point)) )
      }
      else all.push(n);
    })

    return all
  }


  function truefn(){return true}
  function falsefn(){return false}
  function noval(v){return _.isUndefined(v)||_.isNull(v)}

  var valrule = function( pass ) {
    return function(ctxt,cb) {
      var v = ctxt.point
      var p = ctxt.rule.spec
      if( !_.isUndefined(v) ) {
        if( !pass(v, p) ) {
          return ctxt.util.fail(ctxt,cb)
        }
      }

      return cb();
    }
  }


  var rulemap = {

    atmostone$:  quantrule( function(f){return f<=1}, 'atmostone$'),
    exactlyone$: quantrule( function(f){return 1==f}, 'exactlyone$'),
    atleastone$: quantrule( function(f){return 1<=f}, 'atleastone$'),


    required$: childrule( function(ctxt,p,v){return !_.isUndefined(v)}, falsefn, 'required$' ),

    notempty$: childrule(
      function(ctxt,p,v){
        return !_.isUndefined(v) && !_.isNull(v) && '' !== v
      },
      truefn,
      'notempty$'
    ),

    string$:   childrule( function(ctxt,p,v){return noval(v) || _.isString(v)}, truefn, 'string$' ),
    integer$:  childrule( function(ctxt,p,v){return noval(v) || _.isNumber(v) && v===(v|0)}, truefn, 'integer$' ),
    number$:   childrule( function(ctxt,p,v){return noval(v) || _.isNumber(v)}, truefn, 'number$' ),
    boolean$:  childrule( function(ctxt,p,v){return noval(v) || _.isBoolean(v)}, truefn, 'boolean$' ),
    date$:     childrule( function(ctxt,p,v){return noval(v) || _.isDate(v)}, truefn, 'date$' ),
    array$:    childrule( function(ctxt,p,v){return noval(v) || _.isArray(v)}, truefn, 'array$' ),
    object$:   childrule( function(ctxt,p,v){return noval(v) || _.isObject(v) && !_.isArray(v)}, truefn, 'object$' ),
    function$: childrule( function(ctxt,p,v){return noval(v) || _.isFunction(v)}, truefn, 'function$' ),

    lt$:  valrule( function(p,v){return p < v} ),
    lte$: valrule( function(p,v){return p <= v} ),
    gt$:  valrule( function(p,v){return p > v} ),
    gte$: valrule( function(p,v){return p >= v} ),

    min$: valrule( function(p,v){return p >= v}),
    max$: valrule( function(p,v){return p <= v}),

    uniq$: function(ctxt,cb){
      var value = ctxt.point
      var o = {}

      for( var i=0; i<value.length;i++ ) {
        if(_.has(o, value[i])){
          return ctxt.util.fail(ctxt,cb)
        } else {
          o[value[i]]= 1
        }
      }

      return cb()
    },

    only$: function(ctxt,cb) {
      var pn = ctxt.util.proplist(ctxt)

      for( var p in ctxt.point ) {
        if( !_.include(pn,p) ) {
          ctxt.prop = p
          return ctxt.util.fail(ctxt,cb)
        }
      }

      return cb();
    },


    wild$: function(ctxt,cb) {
      var value = ctxt.point

      if( !_.isUndefined(value) ) {
        if( !gex(ctxt.rule.spec).on(value) ) {
          return ctxt.util.fail(ctxt,cb)
        }
      }

      return cb();
    },


    eq$: function(ctxt,cb) {
      var value = ctxt.point

      if( !_.isUndefined(value) ) {
        if( ctxt.rule.spec !== value ) {
          return ctxt.util.fail(ctxt,cb)
        }
      }

      return cb();
    },

    minlen$: lenrule( function(valuelen, conditionlen){return valuelen >= conditionlen} ),
    maxlen$: lenrule( function(valuelen, conditionlen){return valuelen <= conditionlen} ),

    re$: function(ctxt,cb) {
      var value = ctxt.point

      if( !_.isUndefined(value) ) {
        value = ''+value
        var redef = ctxt.rule.spec
        var reopt = void(0)

        var m = /^\/(.*)\/(\w*)$/.exec(ctxt.rule.spec)
        if( m ) {
          redef = m[1]
          reopt = m[2]
        }

        var re = new RegExp(redef,reopt)

        if( !re.exec(value) ) {
          return ctxt.util.fail(ctxt,cb)
        }
      }

      return cb();
    },


    type$: function(ctxt,cb) {
      var pn = ctxt.util.proplist(ctxt)

      var checkmap = {
        string:_.isString,
        number:_.isNumber,
        integer:function(v){return _.isNumber(v) && v===(v|0)},
        boolean:_.isBoolean,
        date:_.isDate,
        array:_.isArray,
        object:function(v){return _.isObject(v) && !_.isArray(v) && !_.isDate(v)},
        'function':function(v){return _.isFunction(v)}
      }

      var found = 0;
      _.each(pn, function(p){
        var check = checkmap[p.toLowerCase()]
        if( check ) {
          found += check(ctxt.point)
        }
      })

      if( !found ) {
        return ctxt.util.fail(ctxt,cb)
      }

      return cb();
    },

    format$: function(ctxt,cb) {
      var pn = ctxt.util.proplist(ctxt)

      var checkmap = {
        datetime:    function checkFormatRegex(v) { return /\d{4}-(0[1-9]|1[1-2])-([0-2]\d|3[0-1])T([0-1]\d|2[0-4]):[0-5]\d:[0-5]\dZ/.test(v) },
        date:        function checkFormatRegex(v) { return /\d{4}-[0-1][0-2]-[0-2]\d/.test(v) },
        time:        function checkFormatRegex(v) { return /([0-1]\d|2[0-4]):[0-5]\d:[0-5]\dZ/.test(v) },
        utcmillisec: _.isNumber,
        re:          _.isRegExp
      }

      var found = 0;
      _.each(pn, function(p){
        var check = checkmap[p.toLowerCase()]
        if( check ) {
          found += check(ctxt.point)
        }
      })

      if( !found ) {
        return ctxt.util.fail(ctxt,cb)
      }

      return cb();
    },

    default$: function(ctxt,cb) {
      return cb();
    },

    enum$: function(ctxt,cb) {
      var value = ctxt.point
      var okvals = ctxt.rule.spec

      var avalue = []

      if ( _.isArray(value) ) {
        avalue = value
      }
      else {
        avalue[0] = value
      }

      var iserror = 0
      if( avalue ) {
        _.each(avalue, function(p){
          iserror += (-1 == okvals.indexOf(p) )
        })
      }
      if ( iserror ){
        return ctxt.util.fail(ctxt,cb)
      }

      return cb();
    },





    // internal rules


    iterate$: function(ctxt,cb) {
      var pn = [ctxt.rule.spec.prop]

      if( _.isObject(ctxt.point) ) {
        if( _.isArray(ctxt.point) ) {
          pn = gex( ctxt.rule.spec.prop ).on( _.range(ctxt.point.length))
        }
        else {
          pn = _.keys(gex( ctxt.rule.spec.prop ).on(ctxt.point))
        }
      }

      var subctxt = ctxt.util.clone(ctxt)
      subctxt.rules = ctxt.rule.spec.rules

      function eachprop(propI) {
        if( propI < pn.length ) {
          var p = pn[propI]

          var psubctxt = ctxt.util.clone(subctxt)

          psubctxt.parents = subctxt.parents.concat({prop:p,point:subctxt.point})

          psubctxt.prop  = p
          psubctxt.point = subctxt.point ? subctxt.point[p] : null

          psubctxt.util.execrules(psubctxt,function(err){
            if( err ) return cb(err);
            eachprop(propI+1)
          })
        }
        else cb()
      }
      eachprop(0)
    },


    recurse$: function(ctxt,cb) {

      var recurctxt = ctxt.util.clone(ctxt)
      recurctxt.point = {$:ctxt.point}
      recurse('$',recurctxt.point,cb)

      function recurse(prop,point,cb) {
        if( !_.isObject(point) ) {
          return cb(null)
        }

        var pn = _.keys( point )

        var subctxt = ctxt.util.clone(ctxt)
        subctxt.rules   = ctxt.rule.spec.rules
        subctxt.parents = '$'!=prop?subctxt.parents.concat({prop:subctxt.prop,point:subctxt.point}):subctxt.parents

        function eachprop(propI,cb) {
          if( propI < pn.length ) {
            var p = pn[propI]
            var eachpropctxt = subctxt.util.clone(subctxt)
            eachpropctxt.prop  = p
            eachpropctxt.point = point[p]
            eachpropctxt.parents = '$'!=p?eachpropctxt.parents.concat({prop:subctxt.prop,point:subctxt.point}):eachpropctxt.parents

            eachpropctxt.util.execrules(eachpropctxt,function(err){
              if( err ) return cb(err);

              recurse(p,eachpropctxt.point,function(err){
                if( err ) return cb(err);

                eachprop(propI+1,cb)
              })
            })
          }
          else {
            return cb(null)
          }
        }
        eachprop(0,cb)
      }
    },


    descend$: function(ctxt,cb) {
      var subctxt = ctxt.util.clone(ctxt)
      var prop = ctxt.rule.spec.prop

      subctxt.rules   = ctxt.rule.spec.rules
      subctxt.prop    = prop
      subctxt.point   = ctxt.point[prop]
      subctxt.parents = subctxt.parents.concat({prop:prop,point:ctxt.point})

      subctxt.util.execrules(subctxt,function(err){
        if( err ) return cb(err);
        cb(null)
      })
    }
  }


  var msgsmap = {
    no_input$:   "There is no input parameter",

    atmostone$:  "At most one of these properties can be used at a time: '<%=value%>'  (parent: <%=parentpath%>).",
    exactlyone$: "Exactly one of these properties must be used: '<%=value%>' (parent: <%=parentpath%>).",
    atleastone$: "At least one of these properties is required: '<%=value%>' (parent: <%=parentpath%>).",

    required$:   "The property '<%=property%>' is missing and is always required (parent: <%=parentpath%>).",
    notempty$:   "The property '<%=property%>' requires a value (parent: <%=parentpath%>).",

    string$:     "The property '<%=property%>', with current value: '<%=value%>', must be a string (parent: <%=parentpath%>).",
    integer$:    "The property '<%=property%>', with current value: '<%=value%>', must be a integer (parent: <%=parentpath%>).",
    number$:     "The property '<%=property%>', with current value: '<%=value%>', must be a number (parent: <%=parentpath%>).",
    boolean$:    "The property '<%=property%>', with current value: '<%=value%>', must be a boolean (parent: <%=parentpath%>).",
    date$:       "The property '<%=property%>', with current value: '<%=value%>', must be a date (parent: <%=parentpath%>).",
    array$:      "The property '<%=property%>', with current value: '<%=value%>', must be a array (parent: <%=parentpath%>).",
    object$:     "The property '<%=property%>', with current value: '<%=value%>', must be a object (parent: <%=parentpath%>).",
    function$:   "The property '<%=property%>', with current value: '<%=value%>', must be a function (parent: <%=parentpath%>).",

    only$:       "The property '<%=property%>' is not recognised here. Recognised properties are: <%=rule.spec%> (parent: <%=parentpath%>).",

    wild$:       "The value <%=value%> does not match the expression '<%=rule.spec%>' (parent: <%=parentpath%>).",
    re$:         "The value <%=value%> does not match the regular expression <%=rule.spec%> (parent: <%=parentpath%>).",
    type$:       "The value <%=value%> is not of type '<%=rule.spec%>' (parent: <%=parentpath%>).",
    format$:     "The value <%=value%> is not of format '<%=rule.spec%>' (parent: <%=parentpath%>).",

    minlen$:     "The property '<%=property%>', with current value: '<%=value%>', must have minimum length '<%=rule.spec%>' (parent: <%=parentpath%>).",
    maxlen$:     "The property '<%=property%>', with current value: '<%=value%>', must have maximum length '<%=rule.spec%>' (parent: <%=parentpath%>).",

    eq$:         "The value <%=value%> does not equal '<%=rule.spec%>' (parent: <%=parentpath%>).",
    lt$:         "The value <%=value%> is not less than '<%=rule.spec%>' (parent: <%=parentpath%>).",
    lte$:        "The value <%=value%> is not less than or equal with '<%=rule.spec%>' (parent: <%=parentpath%>).",
    gt$:         "The value <%=value%> is not greater than '<%=rule.spec%>' (parent: <%=parentpath%>).",
    gte$:        "The value <%=value%> is not not greater than or equal with '<%=rule.spec%>' (parent: <%=parentpath%>).",
    min$:        "The value <%=value%> is not not greater than or equal with '<%=rule.spec%>' (parent: <%=parentpath%>).",
    max$:        "The value <%=value%> is not less than or equal with '<%=rule.spec%>' (parent: <%=parentpath%>).",
    uniq$:       "The value <%=value%> has duplicate elements.",
    enum$:       "The value <%=value%> must be one of '<%=rule.spec%>' (parent: <%=parentpath%>)."

  }




  function clone(ctxt) {
    var newctxt = {
      rules:ctxt.rules,
      point:ctxt.point,
      msgs:ctxt.msgs,
      log:ctxt.log,
      parents:ctxt.parents,
      util:ctxt.util
    }
    return newctxt;
  }


  function formatparents(parents,topname) {
    var out = topname || 'top level'
    if( 0 < parents.length ) {
      out = _.map(parents,function(p){return p.prop}).join('.')
      if( topname ) {
        out = topname+'.'+out
      }
    }

    return out
  }


  function killcircles() {
    var seen = []
    return function(k,v){
      if( _.contains(seen,v) ) return '[CIRCULAR-REFERENCE]';
      seen.push(v)
      return v
    }
  }



  function fail() {
    var code = arguments[0]
    var ctxt = arguments[1]
    var cb   = arguments[2]

    if( !cb ) {
      ctxt = arguments[0]
      cb   = arguments[1]
      code = ctxt.rule.name
    }

    if(!cb) {
      throw new Error('Parambulator: ctxt.util.fail: callback undefined')
    }

    if(!ctxt) {
      return cb(new Error('Parambulator: ctxt.util.fail: ctxt undefined'))
    }

    var inserts = {
      property:ctxt.prop,
      value:ctxt.value||JSON.stringify(ctxt.point,killcircles()),
      point:ctxt.point,
      rule:ctxt.rule,
      parentpath:ctxt.util.formatparents(ctxt.parents),
      json:function(v){return JSON.stringify(v,killcircles())}
    }

    var msg = ctxt.msgs[code] || code

    if( _.isFunction(msg) ) {
      msg = msg(inserts,ctxt)
    }
    else {
      msg = ctxt.util.msgmods( msg )
      msg = _.template(msg,inserts)
    }

    var err = new Error( msg )

    err.parambulator = {
      code:     code,
      property: ctxt.prop,
      value:    ctxt.point,
      expected: (ctxt.rule ? ctxt.rule.spec : void 0),
      parents:  ctxt.parents,
      point:    ctxt.point,
      rule:     ctxt.rule}
    return cb(err)
  }


  // Return an ordered array of property names. The prefix __ is removed
  // from property names, both in the returned array, and the original
  // object.
  function proporder(obj) {
    var pn = []
    for( var p in obj ) {
      var pc = p
      if( 0 === p.indexOf('__') ) {
        pc = p.substring(2)
        obj[pc] = obj[p]
        delete obj[p]
      }
      pn.push(pc)
    }
    return pn
  }


  /*

   name$ -> rule name
   name  -> property names

   */
  function Parambulator( spec, pref ) {
    var self = {}
    pref = pref || {}
    var defaultrules = []

    if( _.isString(spec) ) {
      spec = jsonic(spec)
    }

    if( !spec || !_.isObject(spec) || _.isArray(spec) ) {
      throw new Error('Parambulator: spec argument is not an object')
    }

    /*
     if( exp.ownparams ) {
     exp.ownparams.validate(spec,function(err){
     if( err ) throw err;
     })
     }
     */

    if( pref ) {
      if( exp.ownprefs ) {
        exp.ownprefs.validate(pref,function(err){
          if( err ) throw err;
        })
      }

      if( pref.valid && exp ) {
        var prefparams = exp({'**':pref.valid})
        prefparams.validate(spec,function(err){
          if( err ) throw err;
        })
      }
    }


    //var rulenames = proporder(spec)
    var rules = parse(spec)
    parsedefault(spec, [], [])


    self.toString = function() {
      return JSON.stringify(rules)
    }


    /*
     * Example:
     * For a: {default$:123, type$:'number'}
     * creates {"pathnames":["a"],"pathtypes":[],"defaultvalue":123}
     *
     * for d: {type$: 'array', __0: {default$:'arraytest0'}}
     * creates {"pathnames":["d","0"],"pathtypes":["array"],"defaultvalue":"arraytest0"}
     */
    function parsedefault(spec, path, pathtypes){
      var innerulenames = []
      var currentruletype = 'object'

      for(var name in spec){
        if(spec.hasOwnProperty(name)) {
          var rule = spec[name]
          if ('default$' == name){
            var defaultrule = {}
            defaultrule.pathnames = path

            defaultrule.pathtypes = pathtypes.splice(1,pathtypes.length)
            defaultrule.defaultvalue = rule
            defaultrules.push(defaultrule)
          }
          if ('type$' == name){
            currentruletype = rule
          }
          if( _.isObject(rule) && !_.isArray(rule) ) {
            innerulenames.push(name)
          }
        }
      }

      for (var index in innerulenames){
        if(innerulenames.hasOwnProperty(index)) {
          var inner_rule = spec[innerulenames[index]]

          var newpath = path.slice()
          newpath.push(innerulenames[index])

          var newpathtypes = pathtypes.slice()
          newpathtypes.push(currentruletype)
          parsedefault(inner_rule, newpath, newpathtypes)
        }
      }
    }


    function buildrule(name,rulespec) {
      var func = (pref && pref.rules) ? pref.rules[name] : null
      if( !func ) {
        func = rulemap[name]
      }

      if( func ) {
        var rule = {
          func:func,
          name:name,
          spec:rulespec
        }
        return rule
      }
      else {
        throw new Error("Parambulator: Unknown rule: "+name)
      }
    }


    function parse(spec) {
      var rules = []
      var names = proporder(spec)
      _.each(names, function(name){
        var rulespec = spec[name]


        // enables multiple rules of same name
        if( 'list$' == name ) {
          for(var i = 0; i < rulespec.length; i++) {
            var rs = {}
            rs[rulespec[i][0]]=rulespec[i][1]
            rules.push(parse(rs)[0])
          }
        }

        // enables quoting of property names that end in $
        else if( 'prop$' == name ) {
          var subrules = parse( rulespec.rules )
          var rule = buildrule('descend$',{prop:rulespec.name,rules:subrules})
          rules.push(rule)
        }


        // it's a rule - name$ syntax
        else if( name.match(/\$$/) ) {
          if((name === 'required$' || name === 'notempty$') && 
             pref.multiErrors && 
             _.isArray(rulespec)) 
          {
            _.each(rulespec, function(item) {
              var item_rule = buildrule(name,[item],spec)
              rules.push(item_rule)
            })
          } 
          else {
            var build_rule = buildrule(name,rulespec,spec)
            rules.push(build_rule)
          }
        }


        else if( '**' == name ) {
          var starstar_subrules = parse( rulespec )
          var starstar_rule = 
                buildrule('recurse$',{prop:name,rules:starstar_subrules})
          rules.push(starstar_rule)
        }


        // it's a property
        else {
          if( _.isObject(rulespec) && !_.isArray(rulespec) ) {

            _.each( rulespec, function(v,p){
              if( p.match(/\$$/) && _.isBoolean(v) && v ) {
                var rule = buildrule(p,name,spec)
                rules.push(rule)
                delete rulespec[p]
              }
            })

            var prop_subrules = parse( rulespec )
            var prop_rule = buildrule('iterate$',{prop:name,rules:prop_subrules})
            rules.push(prop_rule)
          }


          else if( _.isString(rulespec) ) {

            // foo:'required$'
            if( rulespec.match(/\$/) ) {
              var rulespecs = rulespec.split(/\s*,\s*/)
              _.each( rulespecs, function( rulespec ) {
                rules.push( buildrule(rulespec,name) )
              })
            }

            // foo:'bar*'
            else {
              rules.push( buildrule('descend$',{
                prop:name,rules:[buildrule('wild$',rulespec)]
              }))
            }
          }

          // TODO: else check for other types, and use eq$ !!!

          else if( _.isNumber(rulespec) ) {
            rules.push( buildrule('descend$',{
              prop:name,rules:[buildrule('eq$',rulespec)]
            }))
          }

          else if( _.isBoolean(rulespec) ) {
            rules.push( buildrule('descend$',{
              prop:name,rules:[buildrule('eq$',rulespec)]
            }))
          }

          else {
            throw new Error("Parambulator: Unrecognized rule specification: "+rulespec)
          }
        }

      })

      return rules
    }


    var msgs = _.extend({},msgsmap,pref?pref.msgs:null)


    self.validate = function( args, cb ) {
      var reterr
      var callback = pref.callbackmaker ? pref.callbackmaker(cb) : (cb||function(){})
      var wrapcb = function(err){
        reterr=err
        // console.log('VALIDATE', JSON.stringify(arguments), arrayify(arguments))
        callback.apply(null,arguments)
      }
      var errors = []


      function execrules(ctxt,cb) {
        if( _.isUndefined(args) ) {
          return fail('no_input$',ctxt,cb)
        }

        var rules = ctxt.rules

        function execrule(ruleI) {
          if( ruleI < rules.length ) {
            var rule = rules[ruleI]

            if( !ctxt.point ) {
              return execrule(ruleI+1)
            }

            ctxt.rule = rule

            var specstr = JSON.stringify(rule.spec,killcircles())

            ctxt.log.push('rule:'+rule.name+':exec:'+specstr)

            rule.func(ctxt, function(err) {
              if( err ) {
                if(_.isArray(err)) {
                  // huh !?
                  // errors = errors.concat(err)
                } else {
                  errors.push(err)
                  ctxt.log.push('rule:'+rule.name+':fail:'+specstr)
                }
                execrule(ruleI+1)
              }
              else {
                ctxt.log.push('rule:'+rule.name+':pass:'+specstr)
                execrule(ruleI+1)
              }
            })
          }
          else {
            if(errors.length > 0 && pref.multiErrors) {
              cb(errors,{log:ctxt.log})
            } else {
              var err = errors.length > 0 ? errors[0] : null;
              cb(err,{log:ctxt.log})
            }

          }
        }

        execrule(0)
      }

      /*
       * Example:
       * For a: {"pathnames":["a"],"pathtypes":[],"defaultvalue":123}
       * creates {a:123}
       *
       * for d: {"pathnames":["d","0"],"pathtypes":["array"],"defaultvalue":"arraytest0"}
       * creates {d: ['arraytest0']}
       */
      function validatedefaults(ctxt, cb){
        for (var ruleindex in defaultrules){
          var rule = defaultrules[ruleindex]
          var obj = ctxt.point

          for (var index in rule.pathnames){
            var location = rule.pathnames[index]
            if ( !_.has(obj, location) ){
              // if is last in path then just add default value
              if (index == rule.pathnames.length - 1){
                obj[location] = rule.defaultvalue
              }
              // else create object or array and continue following path
              else{
                var type = rule.pathtypes[index]
                var newobj
                if ('object' == type){
                  newobj = {}
                }
                else if ('array' == type){
                  newobj = []
                }
                else{
                  // cannot continue, call cb and return false;
                  ctxt.util.fail('default$',ctxt,cb)
                  return;
                }
                obj[location] = newobj
                obj = newobj
              }
            }
            else{
              obj = obj[location]
            }
          }
        }
        cb();
      }

      var ctxt = {rules:rules,point:args,msgs:msgs,log:[],parents:[]}
      ctxt.util = {
        formatparents:function(){
          var args = arrayify(arguments)
          args[1] = pref && pref.topname && !args[1] ? pref.topname : args[1]
          return formatparents.apply(null,args)
        },
        msgmods:function(msg) {
          return (pref.msgprefix||'') + msg + (pref.msgsuffix||'')
        },
        fail:fail,proplist:proplist,execrules:execrules,clone:clone}

      validatedefaults(ctxt,function(err){
        if (err){
          wrapcb(err,{log:ctxt.log})
        }
        else {
          execrules(ctxt,function(err){
            wrapcb(err,{log:ctxt.log})
          })
        }
      })

      // only works if no async calls inside rules
      return reterr
    }


    return self
  }


  var exp = function(){
    var args = arrayify(arguments)
    return Parambulator.apply(this,args)
  }

  // this is where Parambulator validates it's own input
  exp.ownparams = new Parambulator({
    '**':
    {
      strings$: ['required$','notempty$','atmostone$','exactlyone$','atleastone$'],
      list$:[
        ['prop$',{name:'wild$', rules:{type$:'string'}}],
        ['prop$',{name:'type$', rules:{type$:['string','array']}}],
        ['prop$',{name:'format$', rules:{type$:['string','array']}}],
        ['prop$',{name:'re$',   rules:{type$:'string'}}],

        ['prop$',{name:'type$', rules:{enum$:['string','number','integer','boolean','date','array','object',]}}],
        ['prop$',{name:'format$', rules:{enum$:['datetime','date','time','utcmillisec', 're']}}],

        ['prop$',{name:'minlen$', rules:{type$:'number'}}],
        ['prop$',{name:'maxlen$', rules:{type$:'number'}}],

        ['prop$',{name:'enum$', rules:{type$:'array'}}],
        ['prop$',{name:'list$', rules:{type$:'array'}}],

        // This can work only after #1 is implemented
        // these should also work for strings, right?
        //      ['prop$',{name:'lt$',  rules:{type$:['number','date']}}],
        //      ['prop$',{name:'lte$', rules:{type$:['number','date']}}],
        //      ['prop$',{name:'gt$',  rules:{type$:['number','date']}}],
        //      ['prop$',{name:'gte$', rules:{type$:['number','date']}}],
        //      ['prop$',{name:'min$', rules:{type$:['number','date']}}],
        //      ['prop$',{name:'max$', rules:{type$:['number','date']}}],

        ['prop$',{name:'uniq$', rules:{type$:'array'}}]
      ]
    }
  }, {
    __ownparams__:true,
    rules: {
      strings$: function(ctxt,cb){
        var pn = ctxt.rule.spec

        if( !_.isArray(pn) ) {
          pn = [''+pn]
        }

        for( var pI = 0; pI < pn.length; pI++ ) {
          var p   = pn[pI]
          var val = ctxt.point[p]

          if( !_.isUndefined(val) ) {
            if( _.isString(val) ) {
              // ok
            }
            else if( _.isArray(val) ) {
              for(var i = 0; i < val.length; i++ ) {
                if( !_.isString(val[i]) ) {
                  ctxt.prop = p
                  return ctxt.util.fail(ctxt,cb)
                }
              }
            }
            else {
              ctxt.prop = p
              return ctxt.util.fail(ctxt,cb)
            }
          }
        }

        cb(null)
      }
    },
    msgs: {
      'strings$': 'The <%=property%> rule needs a string or array of strings (property: <%=parentpath%>).'
    },
    topname:'spec'
  })


  // validate preferences
  exp.ownprefs = new Parambulator({
    object$:['valid','rules','msgs'],
    string$:['topname','msgprefix','msgsuffix'],
    boolean$:['multiErrors'],
    function$:['callbackmaker'],
    only$:['valid','rules','msgs', 'topname','msgprefix','msgsuffix', 'multiErrors', 'callbackmaker']
  },{
    topname:'prefs'
  })

  exp.Parambulator = Parambulator


  //module.exports = exp



  root.parambulator = exp

  exp.noConflict = function() {
    root.parambulator = previous_parambulator;
    return self;
  }


  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = exp
    }
    exports.parambulator = exp
  }
  else {
    root.parambulator = exp
  }

}).call(this);

# parambulator - Node.js module


A simple way to generate nice error messages for named parameters.

This module is used by the <a href="http://senecajs.org">Seneca framework</a> for input validation.

This module works on both Node.js and browsers.

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

[![Gitter chat](https://badges.gitter.im/rjrodger/parambulator.png)](https://gitter.im/rjrodger/parambulator)

Current Version: 1.5.1

Tested on: node 0.10, 0.11, 0.12, iojs, Chrome 43, Safari 7, Firefox 38

[![Build Status](https://travis-ci.org/rjrodger/parambulator.png?branch=master)](https://travis-ci.org/rjrodger/parambulator)

[Annotated Source](http://rjrodger.github.io/parambulator/doc/parambulator.html)


# Usage

Use this module to validate input or configuration parameters provided
as JSON. You can ensure that the JSON structure and data types are
what you need. You'll get friendly, useful error messages for your
users, and that makes your API better!

```javascript
var parambulator = require('parambulator')

var paramcheck = parambulator({ 
  price: {type$:'number'}
})

// this passes
paramcheck.validate( { price: 10.99 }, function(err) { console.log(err) } )

// this fails - price should be a number
paramcheck.validate( { price: 'free!' }, function(err) { console.log(err) } )
// output: The value 'free!' is not of type 'number' (parent: price). 
```

_Why?_

You're writing a module and you accept configuration as a structured
JavaScript object. For example, opening a database connection:
[MongoDB driver](http://mongodb.github.com/node-mongodb-native/api-generated/server.html). Or
you want to have named parameters:
[http.request](http://nodejs.org/api/http.html#http_http_request_options_callback).

It's nice to be able to validate the input and provide useful error messages, without hand-coding the validation.


_But What About JSONSchema!_

Yes, [JSONSchema](http://json-schema.org) would be the proper way to do this. But the syntax is too hard, and the error messages aren't friendly. This is a [Worse is Better!](http://www.jwz.org/doc/worse-is-better.html) approach.

There's also a philosophical difference. JSONSchema defines a formal structure, so you need to be fairly precise and complete. Parambulator defines a list of rules that are tested in the order you specify, and you can be vague and incomplete.


Key Features:

   * Easy syntax, rules are tested in order
   * Add your own rules
   * Customize the error messages
   
And yes Virginia, it does [validate its own input](http://en.wikipedia.org/wiki/Self-hosting).


## Installation

    npm install parambulator

or

    bower install parambulator


And in your code:

    var parambulator = require('parambulator')

or

    <script src="bower_components/parambulator/parambulator-min.js"></script>


## Usage

Import the module using the standard _require_ syntax:

```javascript
var parambulator = require('parambulator')
```

This is a function that creates _Parambulator_ object instances. This function accepts two arguments:

   * _spec_ - the rule specification to test against
   * _pref_ - your preferences, such as custom error messages and rules

Example:

```javascript
var paramcheck = parambulator({ price: {type$:'number'} })
```


The _paramcheck_ variable is an instance of _Parambulator_. This object only has one method: _validate_, which accepts two arguments:

   * _args_: the object to validate
   * _cb_: a callback function, following the standard Node.js error convention (first arg is an Error)

Example:

```javascript
paramcheck.validate( { price: 10.99 }, function(err) { console.log(err) } )
```


The callback function is called when the validation has completed. Processing of rules stops as soon as a rule fails. If validation fails, the first argument to the callback will be a standard JavaScript _Error_ object, with an error message in the _message_ property.


### Examples

Heavily commented examples are provided in the _doc/examples_ folder: https://github.com/rjrodger/parambulator/tree/master/doc/examples

You should probably read this rest of this first, though. 


### Rules

The validation rules are defined in the _spec_ argument to _parambulator_. The rules are specified as an object, the properties of which are the rule names, and the values the rule options, like so: `{required$:['foo','bar']}`. The rules are executed in the order that they appear (JavaScript preserves the order of object properties).

Rule names always end with a `$` character. Properties that do not end with `$` are considered to be literal property names:

```javascript
{
  required$: ['foo','bar'],
  foo: {
    type$: 'string'
  }
}
```

This specification requires the input object to have two properties, _foo_ and _bar_, and for the _foo_ property to have a string value. For example, this is valid:

```javascript
{ foo:'hello', bar:1 }
```

But these are not:
```javascript
{ foo:1, bar:1 }  // foo is not a string
{ foo:'hello' }   // bar is missing
```

The rules are evaluated in the order they appear:

   1. at the current property (i.e. the top level), check for properties _foo_ and _bar_, as per `required$: ['foo','bar']`
   2. descend into the _foo_ property, and check that it's value is of `type$: 'string'` 

You can nest rules within other rules. They will be evaluated in the order they appear, depth first.

For each input property, the rules apply to the value or values within that property. This means that your rule specification mirrors the structure of the input object.

For example, the specification:

```javascript
{
  foo: {
    bar: { type$: 'integer' }
  }
}
```

matches

```javascript
{ foo: { bar: 1 } }
```

but does not match

```javascript
{ bar: { foo: 1 } }
```

In general, rules are permissive, in that they only apply if a given property is present. You need to use the _required$_ rule to require that a property is always present in the input.

Each rule has a specific set of options relevant to that rule. For example, the _required$_ rule takes an array of property names. The type$ rule takes a string indicating the expected type: _string_, _number_, _boolean_, etc. For full details, see the rule descriptions below.

Literal properties can also accept a wildcard string expression. For example:

```javascript
{ foo: "ba*" }
```

This matches:

```javascript
{ foo: "ba" }
{ foo: "bar" }
{ foo: "barx" }
```

but not

```javascript
{ foo: "b" }
```



### Wildcards

Sometimes you don't know the property names in advance. To handle this case, you can also use wildcard expressions in literal properties:

```javascript
{ 'a*': { type$: 'boolean' } }
```

This matches:

```javascript
{
  a: true,
  ax: false,
  ayz: true
}
```

In particular, `'*'` on its own will match any property (at the same level). Wildcard expressions have the usual syntax: `*` means match anything, and `?` means match a single character.


What about repeatedly nested rules? In this situation, you want to apply the same set of rules at any depth. You can use the special literal property `'**'` to achieve this:

```javascript
{ '**': { a: {type$: 'boolean' } } }
```

This matches:

```javascript
{ a:true, x:{a:false, y:{a:true}}}
```

ensuring that any properties called _a_ will be an integer. The recursive descent starts from the current level.


### Arrays

Arrays are treated as if they were objects. The property names are simply the string values of the integer array indexes. For example:

```javascript
{ a: {'0':'first'} }
```

This matches:

```javascript
{ a:['first'] } 
```

Due to a quirk in the Chrome V8 engine, the order of integer properties is not preserved. Use the special prefix `__` as a workaround:

```javascript
{ a: {'__1':'first', '__0':'second'} }
```

This matches:

```javascript
{ a:['second','first'] } 
```

but the rules are tested in order:

   1. `'__1':'first'`
   2. `'__0':'second'`



### Custom Errors

Each rule has an associated error message. By default these explain the reason why a rule failed, and give the property path (in standard JavaScript dot syntax: `foo.bar.baz`) of the offending value. You can customize these error messages, by providing your own string templates, or by providing a function that returns the error message text.

Use the _msgs_ property of the _pref_ argument (the second argument to _parambulator_) to define custom error messages:

```javascript
var pm = parambulator({...},{
  msgs: {
     required$: 'Property <%=property%> is required, yo!'
  }
})
```

The template syntax is provided by the _underscore_ module: http://underscorejs.org/#template

The following properties are available:

   * _property_: the relevant property name
   * _value_: the string representation of the value that failed in some way
   * _point_: the actual value, which could be of any type, not just a string
   * _rule.name_: the name of the rule 
   * _rule.spec_: the rule specification, e.g. `'boolean'` for rule `type$:'boolean'` 
   * _parentpath_: a string locating the value in the input (properties in dot-syntax)
   * _json_: a reference to the JSON.stringify function, use like so: <%=json(rule.spec)%>

The _parentpath_ will use the term _top level_ when the error concerns
the top level of the input object. You can customize this term using the _topname_ option:

```javascript
var pm = parambulator({...},{
  topname: 'name_of_param_in_my_function_definition'
})
```

You can also modify the error message using the _msgprefix_ and
_msgsuffix_ options, which are prepended and appended to the message
body, respectively, and also support the template syntax.


You can also specify a custom error message using a function. This
lets you customize on the specific failing conditions, such as the
property name:

```javascript
var pm = parambulator({...},{
  msgs: {
     required$: function(inserts){
        if( 'voodoo' == inserts.property ) {
          return "don't dare do: "+inserts.value
        }
        else {
          return 'Property '+inserts.property+' is required, yo!'
        }
     }
  }
})
```

The _inserts_ parameter is an object containing the properties as above.


## Rules

The following rules are provided out-of-the-box. To define your own rules, see below.

Each rule operates at the current _point_. This is the current property location inside the input object.

For example, with input:

```javascript
{
  foo: {
    bar: {
      baz: 'zzz'
    }
  }
}
```

the _point_ `foo.bar` is the object:

```javascript
{ baz: 'zzz'} 
```


### literal property

Match an input property. You can use wildcards. Accepts a set of sub rules, or a wildcard string to match against. The property names match against property names in the current point.

```javascript
{
  a:    { ... }
  'b*': { ... }
  c:    'z*'
}
```


### boolean rules

As a convenience, rules that take a property name, such as _required$_, can be specified for a property using the form:

```javascript
{
  foo: 'required$',
  bar: 'required$,string$'
}
```

To use a _$_ symbol literally, use the form:

```javascript
{
  foo: { eq$:'text containing $' }
}
```


### atmostone$

Accept at most one of a list of properties. Accepts an array of property name strings. At most one of them can be present in the current point.

```javascript
{
  atmostone$: ['foo','bar']
}
```


### exactlyone$

Accept exactly one of a list of properties. Accepts an array of property name strings. Exactly one of them must be present in the current point.

```javascript
{
  exactlyone$: ['foo','bar']
}
```


### atleastone$

Accept at least one of a list of properties. Accepts an array of property name strings. At least one of them must be present in the current point.

```javascript
{
  atleastone$: ['foo','bar']
}
```



### required$

Specify a set of required properties. Accepts an array of property name strings, or a single property name. Wildcards can be used. All properties must be present in the current point. Can also appear as a rule specification for literal properties.


```javascript
{ required$: ['foo','b*'] } // wildcards work too!
{ required$: 'bar' }        // for convenience
{ bar: 'required$' }        // for extra convenience
{ bar: {required$:true} }   // for extra extra convenience
{ 'b*': 'required$' }       // and that's just nice
```


### notempty$

Specify a set of properties that cannot be empty, if they are present. Unlike _required$_, these properties can be absent altogether, so use _required$_ if they are also required! Accepts an array of property name strings, or a single property name. Wildcards can be used. All properties are relative to the current point. Can also appear as a rule specification for literal properties.

```javascript
{ notempty$: ['foo','b*'] } // wildcards work too!
{ notempty$: 'bar' }        // for convenience
{ bar: 'notempty$' }        // for extra convenience
{ 'b*': 'notempty$' }       // and that's just nice, again
```

### wild$

Specify a wildcard pattern that the property value must match. The property value does not need to be a string. See the [gex](https://github.com/rjrodger/gex) module documentation.

```javascript
{ foo: {wild$:'b*'} } 
```

### re$

Specify a regular expression that the property value must match. The property value is converted to a string. The regular epxression is given as-is, or can be in the format /.../X, where X is a modifier such as _i_.

```javascript
{ 
  foo: {re$:'a.*'}, 
  bar: {re$:'/b/i'} 
} 
```


### type$

Check that a property value is of a given JavaScript type. Does not require the property to be present (use _required$_ for that). Can only be used as a subrule of a literal property.

```javascript
{ 
  a: {type$:'string'}, 
  b: {type$:'number'}, 
  c: {type$:'integer'}, // can't be decimal! 
  d: {type$:'boolean'}, 
  e: {type$:'date'}, 
  f: {type$:'array'}, 
  g: {type$:'object'}, 
  h: {type$:'function'}
} 
```

As a convenience, the type rules can also be used in the form:

```javascript
{
  $string: 'propname'
}
```


### eq$

Check that a property value is an exactly equal to the given value (must also match type).

```javascript
{ 
  foo: {eq$:'bar'}, 
}
```

### comparisons

The following comparison rules can be used:

   * _lt$_: less than
   * _lte$_: less than or equal to (alias: max$)
   * _gt$_: greater than
   * _gte$_: greater than or equal to (alias: min$)
   * _gt$_: greater than

For example:

```javascript
{ 
  foo: {lt$:100}, 
}
```

Comparisons also work on alphabetically on strings.



### enum$

Check that a property value is one of an enumerated list of values (can be of any type).

```javascript
{ 
  color: {enum$:['red','green','blue']}, 
}
```


### uniq$

Check that a list contains only unique properties.

```javascript
{ 
  rainbow: 'uniq$'
}
```

The above specification validates:

```javascript
{ 
  rainbow: ['red','orange','yellow','green','blue','indigo','violet']
}
```

But does not validate:

```javascript
{ 
  rainbow: ['red','red','red','red','red','red','red']
}
```


### only$

Check that a property _name_ is one of an enumerated list of names, at this point

```javascript
{ 
  options: {only$:['folder','duration','limit']}, 
}
```



### ** recursion

Apply a set of subrules recursively to the current point and all it's children.

```javascript
{ 
  a: {
    '**': {
      b: { type$:'integer' }
    }, 
  }
}
```


## Custom Rules

You can write your own rules if you need additional validation. The [range.js](https://github.com/rjrodger/parambulator/blob/master/doc/examples/range.js) example shows you how.

Define your own rules inside the _rules_ property of the _prefs_ argument to _paramabulator_. Each rule is just a function, for example:

```javascript
var pm = parambulator({...},{
  rules: {
     mynewrule$: function(ctxt,cb){
       ...
     }
  }
})
```

Dont forget the `$` suffix!

The _ctxt_ parameter provides the same interface as the _inserts_ object for custom messages (as above). You can execute callback or evented code inside the rule function. Call the _cb_ callback without any arguments if the rule passes. 

If the rule fails, you can use a utility function to generate an error message:

```javascript
return ctxt.util.fail(ctxt,cb)
```

Just ensure you have a custom message with the same name as the rule!

The built-in rule definitions in [parambulator.js](https://github.com/rjrodger/parambulator/blob/master/parambulator.js) are also a good resource.

Tweet me [@rjrodger](http://twitter.com/rjrodger) if you get stuck.

By the way, if you have a cool new rule and you thing it should be built-in, send me a pull request! Just follow the pattern for, say, _wild$_ in [parambulator.js](https://github.com/rjrodger/parambulator/blob/master/parambulator.js). You'll need entries in _rulemap_, _msgsmap_, and _ownparams_.



### Validation of Custom Rules

When you define a custom rule, you'll want to ensure that rule specifications using it are valid. You can do this by adding validation rules to the optional _valid_ property of the _prefs_ argument.

The [range.js](https://github.com/rjrodger/parambulator/blob/master/doc/examples/range.js) example also shows you how to do this.

There is a gotcha. You need to escape the rule names, so that they are treated as literal properties, and not rules. To do this, use the `prop$` pseudo-rule:

```javascript
{ prop$: {name:'foo', rules:{type$:'string'}} }
```

is equivalent to:

```javascript
{ foo: {type$:'string'} }
```

The other pseudo-rule that may come in handy is the `list$` rule. This lets you specify rules using an array. Each element is a sub array with two elements, the first is the rule name, and the second the rule specification

```javascript
{
  list$: [
    ['foo', {type$:'string'}],
    ['bar', {type$:'string'}],
  ]
}
```

Take a look at the definition of `ownparams` in [parambulator.js](https://github.com/rjrodger/parambulator/blob/master/parambulator.js) to see how _parambulator_ validates its own input.


## Multiple validation errors

When configuring a parambulator instance, it is possible to pass an option so 
that parambulator runs all the validation rules and return multiple errors:

```javascript
var pm = parambulator({...},{
  multiErrors: true
})
```

pm.validate({foo: 'bar}, function(errors) {
  // errors is null or errors.length > 0 
})

## Testing

Tests run on the command line, in a headless browser, and in a normal browser:

```sh
$ npm build
$ npm test
$ npm run browser
$ open test/jasmine.html
```

## Releases

Release numbers are strict [semver](http://semver.org/) as 1.x.x. All
releases are tagged in github with release version.


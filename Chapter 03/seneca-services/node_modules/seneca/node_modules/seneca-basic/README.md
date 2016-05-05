# seneca-basic - a [Seneca](http://senecajs.org) plugin

### Seneca basic utility plugin. 

This plugin is included with the main seneca module and provides a
small set of basic utility action patterns.


### Support

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.3.0

Tested on: Seneca 0.6.2

[![Build Status](https://travis-ci.org/rjrodger/seneca-basic.png?branch=master)](https://travis-ci.org/rjrodger/seneca-basic) 

Built and tested against versions: `0.10, 0.11, 0.12, iojs`

[Annotated Source Code](http://rjrodger.github.io/seneca-basic/doc/basic.html).

[![Gitter chat](https://badges.gitter.im/rjrodger/seneca-basic.png)](https://gitter.im/rjrodger/seneca-basic)



## Action Patterns

### `role:basic, note:true, cmd:set`

Set a note value. Notes are a simple internal per-process
communication mechanism for plugins to exchange data. In particular,
plugins can set keyed values before the plugin that uses the data
reads it. See [seneca-admin](/rjrodger/seneca-admin) for an example.

_Parameters_
 
   * `key`:   string; key name
   * `value`: key value

_Response:_

   * None.


### `role:basic, note:true, cmd:get`

Get a note value.

_Parameters_
 
   * `key`:   string; key name

_Response:_

   * `value`: key value, if defined


### `role:basic, note:true, cmd:push`

Push a note value onto a list. The namespace for lists is separate
from the namespace for single values. The list is created if it does not exist.

_Parameters_
 
   * `key`: string; key name
   * `value`: value to append to list.

_Response:_

   * None.


### `role:basic, note:true, cmd:list`

Get the full list of values for the key, in pushed order.

_Parameters_
 
   * `key`: string; key name

_Response:_

   * Array of values.


### `role:basic, note:true, cmd:pop`

Get the last value of a list, and remove it from the list.

_Parameters_
 
   * `key`: string; key name

_Response:_

   * `value`: key value, if list was non-empty


## Releases

   * 0.3.0: 2015-06-15: Normalized _note_ patterns. Prep for Seneca 0.6.2.







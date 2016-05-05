# seneca-mem-store

### Seneca in-memory data storage plugin. 

This module is a plugin for the Seneca framework. It provides an
in-memory storage engine that provides a set of data storage action
patterns. *Data does not persist betweens runs*.  This plugin is most
useful for early development and unit testing. It also provides an
example of a document-oriented storage plugin code-base.

The Seneca framework provides an 
[ActiveRecord-style data storage API](http://senecajs.org/data-entities.html). 
Each supported database has a plugin, such as this one, that
provides the underlying Seneca plugin actions required for data
persistence.

This plugin is included with the main seneca module.


### Support

Current Version: 0.3.1

Tested on: [Seneca](/rjrodger/seneca) 0.6.2

[![Build Status](https://travis-ci.org/rjrodger/seneca-mem-store.png?branch=master)](https://travis-ci.org/rjrodger/seneca-mem-store)

[Annotated Source Code](http://rjrodger.github.io/seneca-mem-store/doc/mem-store.html).

Built and tested against versions: `0.10, 0.11, 0.12, iojs`

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

[![Gitter chat](https://badges.gitter.im/rjrodger/seneca-mem-store.png)](https://gitter.im/rjrodger/seneca-mem-store)


### Install

This plugin module is included in the main Seneca module:

```sh
npm install seneca
```


## Development & Test

To test, use:

```sh
npm test
```

To install separately (if you're using a fork or branch, say), use:

```sh
npm install seneca-mem-store
```

And in your code:

```js
var seneca = require('seneca')({
  default_plugins:{
    'mem-store':false
  }
})
seneca.use( require('seneca-mem-store') )

```


## Releases

   * 0.3.1: 2015-06-16: export action responds with object: {json: "..."}
   * 0.3.0: 2015-06-16: cmd:import/export no longer uses filesystem, just accepts/provides JSON string. Prep for Seneca 0.6.2.







# reconnect-net

Reconnect a tcp stream when it goes down.

## Usage

```js
var reconnect = require('reconnect-net');
var net = require('net');

// this is the server
net.createServer(function (con) {
  con.end('yup, I\'m up!');
}).listen(8000);

// this is the client
reconnect(function (stream) {
  stream.on('data', console.log);
  // => yup, I'm up!
}).connect(8000)
```

For the events you can listen to, see
[reconnect-core](https://github.com/juliangruber/reconnect-core#usage).

## Installation

With [npm](https://npmjs.org) do:

```
npm install reconnect-net
```

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

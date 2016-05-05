var net = require('net');
var inject = require('reconnect-core');

module.exports = inject(function () {
  var args = [].slice.call(arguments);
  return net.connect.apply(null, args);
});

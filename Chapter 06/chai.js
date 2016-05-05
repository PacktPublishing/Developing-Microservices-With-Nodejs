/*var chai = require('chai');

chai.should();

var foo = "Hello world";
console.log(foo);

foo.should.equal('Hello world');
*/


/*var expect = require('chai').expect;

var foo = "Hello world";

expect(foo).to.equal("Hello world");
*/


/*var expect = require('chai').expect;

var animals = ['cat', 'dog', 'parrot'];

expect(animals).to.have.length(4);*/

var assert = require('chai').assert;
var myStringVar = 'Here is my string';
// No message:
assert.typeOf(myStringVar, 'string');
// With message:
assert.typeOf(myStringVar, 'string', 'myStringVar is not string type.');
// Asserting on length:
assert.lengthOf(myStringVar, 17);

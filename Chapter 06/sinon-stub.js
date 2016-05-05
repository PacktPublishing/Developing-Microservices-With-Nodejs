var sinon = require('sinon');
var expect = require('chai').expect;

function rollDice() {
    return -1 * Math.floor(Math.random() * 6) + 1;
}
describe("When rollDice gets called", function() {
    
    it("Math#random should be called with no arguments", function() {
        sinon.stub(Math, "random");
        rollDice();
        console.log(Math.random.calledWith());
    });
    it("bananas", function() {
        console.log("bananas");
    });
    after(function(){
        http.get.restore();
    });
})

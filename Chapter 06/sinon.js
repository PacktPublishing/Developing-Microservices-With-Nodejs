
var sinon = require('sinon');

require('chai').should();

function calculateHypotenuse(x, y, callback) {
    callback(null, Math.sqrt(x*x + y*x));
}

describe("When the user callculates the hypotenuse", function(){
    it("should execute the callback passed as argument", function() {
        var callback = sinon.spy();
        calculateHypotenuse(3, 3, callback);
        callback.called.should.be.true;
    });
});

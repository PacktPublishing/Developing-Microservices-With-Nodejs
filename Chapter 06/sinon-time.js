
var sinon = require('sinon');
var expect = require('chai').expect

function areWeThereYet(callback) {
    
    setTimeout(function() {
        callback.apply(this);
    }, 10);
    
}

var clock;

before(function(){
    clock = sinon.useFakeTimers();
});

it("callback gets called after 10ms", function () {
    var callback = sinon.spy();
    var throttled = areWeThereYet(callback);

    areWeThereYet(callback);

    clock.tick(9);
    expect(callback.notCalled).to.be.true;
    
    clock.tick(1);
    expect(callback.notCalled).to.be.false;
});

after(function(){
    clock.restore();
});

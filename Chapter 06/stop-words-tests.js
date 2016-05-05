var removeStopWords = require('./remove-stop-words')({bannedWords: ["kitten", "parrot"]});

var chai = require('chai');
var assert = chai.assert;
chai.should();
var expect = chai.expect;

describe('When executing "removeStopWords"', function() {
    
    it('should remove words with less than 3 chars of length', function() {
        removeStopWords('my small list of words', function(err, response) {
            expect(response).to.equal("small list words");
        });
    });
    
    it('should remove extra white spaces', function() {
        removeStopWords('my small       list of words', function(err, response) {
            expect(response).to.equal("small list words");
        });
    });
    
    it('should remove banned words', function() {
        removeStopWords('My kitten is sleeping', function(err, response) {
            expect(response).to.equal("sleeping");
        });
    });
    
    it('should not fail with null as input', function() {
        removeStopWords(null, function(err, response) {
            expect(response).to.equal("small list words");
        });
    });
    
    it('should fail if the input is not a string', function() {
        try {
            removeStopWords(5, function(err, response) {});
            assert.fail();
        }
        catch(err) {
        }
    });
});

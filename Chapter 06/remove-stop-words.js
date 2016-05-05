var _ = require('lodash');
var express = require('express');

module.exports = function(options) {
    var bannedWords = [];
    if (typeof options !== 'undefined') {
        bannedWords = options.bannedWords || [];
    }

    return function removeBannedWords(text, callback) {
       var words = text != null && typeof text !== 'undefined' ? text.split(' ') : [];
       var validWords = [];
       _(words).forEach(function(word, index) {
          var addWord = true;
          
          if (word.length < 3) {
              addWord = false;
          }
          if(addWord && bannedWords.indexOf(word) > -1) {
              addWord = false;
          }
          
          if (addWord) {
             validWords.push(word); 
          }
          
          // Last iteration:
          if (index == (words.length - 1)) {
              console.log(callback);
              callback(null, validWords.join(" "));
          }
       });
    }
}

function init(options) {
    
    function charToNumber(char) {
        return char.charCodeAt(0) - 96;
    }
    
    function StringManipulation() {
    }
    
    var stringManipulation = new StringManipulation();
    
    stringManipulation.contains = function(a, b) {
        return a.indexOf(b) > -1;
    };
    
    stringManipulation.stringToOrdinal = function(str) {
        var result = ""
        for (var i = 0, len = str.length; i < len; i++) {
            result += charToNumber(str[i]);
        }   
        return result;
    }
    return stringManipulation;
}

module.exports = init;

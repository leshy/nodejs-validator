/*
  nodeunit tests
  https://github.com/caolan/nodeunit/
*/

var Validator = require('./index.js').Validator


exports.BasicValidatorChaining = function(test) {
    var validator = Validator().Default("bla").String().Length({minimum: 3, maximum: 30})
    validator.feed(undefined,function (err,data) {
        test.equals(data,'bla')
        test.done();
    })
};


exports.ValidatorForking = function(test) {
    var validator = Validator().Default({bla: 3}).Children({
        bla: "Number", // syntax sugar, check out children validator and Validator() function
        xx: Validator().Default("test").String()
    })
    
    validator.feed(undefined,function (err,data) {
        test.equals(JSON.stringify(data),'{"bla":3,"xx":"test"}')
        test.done();
    })
};

/*
  nodeunit tests
  https://github.com/caolan/nodeunit/
*/

var Validator = require('./index.js').Validator
var colors = require('colors')
exports.Testing = function(test){
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};


exports.BasicValidatorChaining = function(test) {
    var validator = Validator().Debug().Default("bla").String().Length({minimum: 3, maximum: 30})
    validator.feed(undefined,function (err,data) {
        console.log("validation done:".cyan,err,data)
        test.done();
    })
};


exports.ValidatorForking = function(test) {
    var validator = Validator().Debug().Default({bla: 3}).Children({
        bla: Validator().Debug().Number(),
        xx: Validator().Debug().Default("test").String()
    })
    
    validator.feed(undefined,function (err,data) {
        console.log("validation done:".cyan,err,data)
        test.done();
    })
};

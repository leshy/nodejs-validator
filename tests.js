/*
  nodeunit tests
  https://github.com/caolan/nodeunit/
*/

var Validate = require('./index.js').Validate

exports.Testing = function(test){
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};


exports.BasicValidatorChaining = function(test){
//    Validate.String().Length({minimum: 3, maximum: 30}).feed("hello world")
    Validate.Def('hi there').String().Length({minimum: 3, maximum: 5}).feed()
    test.done();
};

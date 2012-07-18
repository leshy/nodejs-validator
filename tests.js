/*
  nodeunit tests
  https://github.com/caolan/nodeunit/
*/

var matcher = require('./index.js')

exports.testSomething = function(test){
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

/*
  nodeunit tests
  https://github.com/caolan/nodeunit/
*/

var Validator = require('./index.js').Validator


exports.BasicChaining = function(test) {
    var validator = Validator().Default("bla").String().Length({minimum: 3, maximum: 30})
    validator.feed(undefined,function (err,data) {
        test.equals(data,'bla')
        test.done();
    })
};


exports.Forking = function(test) {
    var validator = Validator().Default({bla: 3}).Children({
        bla: "Number" , // syntax sugar, check out children validator and Validator() function
        xx: Validator().Default("test").String()
    })
    
    validator.feed({bla : 3 },function (err,data) {
        test.equals(JSON.stringify(data),'{"bla":3,"xx":"test"}')
        test.done();
    })
};



exports.Or = function (test) {

    var validator = Validator({ 
        bla: true,
        // this is a weird one:
        // property 'xx' can only be string or undefined. if its undefined it will be turned into 3
        xx: Validator().Or(
            [
                "String",
                Validator().Not("Exists").Set(3)
            ])
    })

    validator.feed({bla: 3, xx: true},function (err,data) { // this shouldn't pass
        if (err) { 
            validator.feed({bla: 3}, function (err,data) {
                test.equals(JSON.stringify(data),'{"bla":3,"xx":3}') // check if xx was modified properly
                test.done()
            })
        } else {
            test.fail()
        }
    })

}

exports.Select = function (test) {
    test.done()
}



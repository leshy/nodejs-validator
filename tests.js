/*
  nodeunit tests
  https://github.com/caolan/nodeunit/
*/

var v = require('./index.js')
var Validator = v.Validator
var Select = v.Select

exports.BasicChaining = function(test) {

    var validator = Validator()
        .Default("bla")
        .Not(Validator().Is('hello'))
        .String()
        .Length({minimum: 3, maximum: 30})

    validator.feed('hello',function (err,data) { // we feed it 'hello', which is forbidden by Not validator
        if (!err) { test.fail('validator accepted "hello"'); return }

        validator.feed(undefined,function (err,data) { // we feed it undefined, it defaults to 'bla' and passes other checks
            test.equals(data,'bla')
            test.done();
        })

    })
};


exports.Forking = function(test) {
    var validator = Validator()
        .Default({bla: 3})
        .Children({
            xx: Validator().Default("test").String(),
            bla: "Number" // syntax sugar, we don't need to give it validator instance here, we can just mention an argumentless validator
        })
    
    validator.feed({bla : 3 },function (err,data) {
        test.equals(JSON.stringify(data),'{"bla":3,"xx":"test"}')
        test.done();
    })
};


exports.Or = function (test) {
    var validator = Validator({ // note that here we didn't call Validator().Children({ ... }) but validator({ ... }) which is syntax sugar.
        bla: true,
        // this is a weird one:
        // property 'xx' can only be string or undefined. if its undefined it will be turned into 3
        xx: Validator().Or(
            [
                "String",
                Validator().Not("Exists").Set(3) // again, this could have been: Not(Validator().Exists()).Set(3)
            ])
    })

    validator.feed({bla: 3, xx: true},function (err,data) { // this shouldn't pass
        if (err) { 
            validator.feed({bla: 3}, function (err,data) {
                test.equals(JSON.stringify(data),'{"bla":3,"xx":3}') // check if xx was modified properly
                test.done()
            })
        } else {
            test.fail('or validator accepted an invalid input')
        }
    })
}

exports.Select = function (test) {
    var objecttriggered = false
    Select({bla:3}, 
           "Number",function (data,next) { test.fail('object matched as number!') },
           "Object",function (data,next) { objecttriggered = true; next()},
           {bla: true},function (data,next) { test.equals(objecttriggered,true); next(); test.done()})
           
}

exports.LazyInstantiation = function (test) {
    var testargs = { bla : true }
    var validator = Validator(testargs)

    validator.match({bla:1},function (err,data) {
        test.equals(testargs.bla.constructor, Validator().constructor) // make sure validator replaced its own arguments and has instantiated true to Validator().Exists()
        test.done()
    })
}


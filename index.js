/*
  matcher - object or json pattern matching/validation for function arguments, process arguments, api call permissions, messages, etc.
  
  uses verifiers I stole from livevalidation (verify.js) + some aditions
  
  Copyright(c) 2012 Ivan Nikolic [lesh] <lesh@sysphere.org>
  MIT Licensed
*/

var Verify = require('./validate.js').Validate
var _ = require('underscore')

// deretardates the magical arguments object
function toArray(arg) { return Array.prototype.slice.call(arg); }


Verify.Constructor = function (value, paramsObj) { 
    var paramsObj = paramsObj || {};
    var message = paramsObj.failureMessage || "Need a correct type!"
    var type = paramsObj.type
    
    if (value.constructor != type) { 
        Validate.fail(message)
    }
    return true;
}


// creates Validate.Boolean, Validate.String, etc validators...
_.map([ Boolean, String, Function, Object, Array, Number ],function (type) { 
    Verify[type.name] = function (value,paramsObj) { 
        var paramsObj = paramsObj || {};
        paramsObj.type = Boolean
        Verify.Constructor(value, paramsObj)
    }
})


Verify.Url = "implement this plz"


function leafmatch(msg,pattern) {  
    if (!msg) { if (pattern.optional) { return true } else { return false } }    
    
}


//
// expects Target, Pattern, Function, Pattern, Function, Pattern, Function
//
// calls the function next to a pattern that got matched, and provides function (next) as its argument..
// if next is called, matching continues and next function might be executed if its pattern matches, othervise the thing ends.
//
function select() { 
    var args = toArray(arguments)
    if ((args.length < 3) || !(args % 2)) { throw "wrong number of arguments" }
    
    var target = args.shift()

    while (args.length) {
        var pattern = args.shift()
        var callback = args.shift()
        
        if (match(target,pattern)) {
            callback(function () { select(target,args) })
            return
        }
    }
}

function match(msg,pattern) {

    _.map(pattern,function (value,key,patterns) {  
        
        
        
    })



	for (var property in pattern) {
        if ( property == "*" ) { return true; }
	    if (msg[property] == undefined) { return false; }
        if (pattern[property] === undefined) { throw "my property '" + property + "' in my matcher is undefined, wtf" }
        if ((pattern[property].constructor == RegExp) && (msg[property].constructor == String)) { return pattern[property].test(msg[property]) }
	    if (pattern[property] !== true) { 
            var atomicTypes = { Number: true, String: true }
            if (atomicTypes[pattern[property].constructor.name]) { return Boolean(msg[property] === pattern[property] ) } // can I compare you with === ?
            if ((pattern[property].constructor) != (msg[property].constructor)) { return false } // are you of different type? you are surely not the same then!
            if (msg[property].constructor == Object) {  // should I compare deeper?
                return match(msg[property], pattern[property])
            }
            throw "what is this I don't even " + JSON.stringify(msg[property]) + "(" + msg[property].constructor + ") and " + JSON.stringify(pattern[property]) + " (" + pattern[property].constructor + ")"
        }
	}
	return true;
}



exports.validate = function (data,pattern) { 
    return data
}

exports.verify = Verify




/*

  abstract json matching/verification library
  
  accepts a json object and verifies it.
  uses verifiers I stole from livevalidation (verify.js) + some aditions

*/

var Validate = require('./validate.js').Validate
var _ = require('underscore')

Validate.Boolean: function (value, paramsObj) { 
    var paramsObj = paramsObj || {};
    var message = paramsObj.failureMessage || "Need a boolean!";
    if (value.constructor != Boolean) { 
        Validate.fail(message)
    }
    return true;
}

Validate.String: function (value, paramsObj) { 
    var paramsObj = paramsObj || {};
    var message = paramsObj.failureMessage || "Need a boolean!";
    if (value.constructor != String) { 
        Validate.fail(message)
    }
    return true;
}

Validate.Number: function (value, paramsObj) { 
    var paramsObj = paramsObj || {};
    var message = paramsObj.failureMessage || "Need a boolean!";
    if (value.constructor != Number) { 
        Validate.fail(message)
    }
    return true;
}






verify({
    selector: { validators : [ 
        exports.verify.boolType, {} 
    ]}
    
    bla: { def: 'bla', type:}
    
})



function leafmatch(msg,pattern) {  
    if (!msg) { if (pattern.optional) { return true } else { return false } }
    
    
    
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



exports.verify = function (options,required) { 
    
    
    
    
}




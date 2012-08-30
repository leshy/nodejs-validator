/*
  matcher - object or json pattern matching/validation for function arguments, process arguments, api call permissions, messages, etc.
  
  uses verifiers I stole from livevalidation (verify.js) + some aditions
  
  Copyright(c) 2012 Ivan Nikolic [lesh] <lesh@sysphere.org>
  MIT Licensed
*/

var Validate = require('./validate.js').Validate
var _ = require('underscore')
var backbone = require('backbone4000')
var colors = require('colors')
var helpers = require('helpers')


// deretardates the magical arguments object
function toArray(arg) { return Array.prototype.slice.call(arg); }

Validate.Constructor = function (value, paramsObj) { 
    var paramsObj = paramsObj || {};
    var type = paramsObj.type
    var message = paramsObj.failureMessage || "Need a correct type (" + type.name + ")"
    if (value.constructor != type) { 
        Validate.fail(message)
    }
    return true;
}

// creates type validators (Validate.Boolean, Validate.String, etc)
_.map([ Boolean, String, Function, Object, Array, Number ],function (type) { 
    Validate[type.name] = function (value) { 
        return Validate.Constructor(value, {type : type})
    }
})

Validate.Url = "implement this plz" // this is a specialization of validate.format

/*
at this point Verify object contains different validator functions (email, url, boolean, etc)
that accept a thing to validate, and arguments object.

we use these to construct chainable objects that accept some kind of data to validate like so:

Validate().Default('off').String().Format({ match: 'off|on' })


Validator().Default({ meta: {} }).Validate({
    
    queryid: Validate().Default({function () {  }}).Length(30),    
})

*/




/*
  Validatorobject is an object that validates a peace of JSON.
  they can be chained:

  var validator = Validator().Default('bla').String().Length(3)

  validate()  will create an empty validator object,
  default will create its child, that sets default value if there is none 
  string will create another child... etc

  in order to validate a peace of JSON you do a 

  validator.feed(something,callback) 

  callback expects err, and data objects

*/

function ValidatorObject (options) { 
    this.child = undefined
    this.operation = undefined
    this.options = options || {}
}


ValidatorObject.prototype.feed = function (value,callback,origin) {
    if (!this.operation && !this.child) { throw this.name + " noop" }
    
    var self = this
   
    if (this.operation) {
        this.operation(value,this.options,function (err,data) {

            if (err) { callback(err,data); return }
            
            if (!self.child) { 
                callback(err,data); 
            } else {
                if (self.changesValue) { value = data }
                self.child.feed(value,callback)
            }
        })
    } else {
        if (this.child) { this.child.feed(value,callback) }
    }

}

ValidatorObject.prototype.last = function () {
    if (!this.child) { return this } else { return this.child.last() }
}

ValidatorObject.prototype.first = function (value) {
    if (value) { this.firstObject = value } else { 
        return this.firstObject || this
    }
}

ValidatorObject.prototype.opt = function () {
    return this.first().globalOptions
}

ValidatorObject.prototype.Debug = function () {
    this.opt().debug = true
    return this
}


function addObjectToValidators (obj,name) {
    ValidatorObject.prototype[name] = function (options) {
        this.child = new obj(options)
        this.child.name = name
        return this.child
    }
}
// this is kinda crappy, I should pby use my graph lib..
function addFunctionToValidators (validatorf,name,changesValue) {
    ValidatorObject.prototype[name] = function (options) {
        
        var last = this.last()
        var opt = this.opt()
        
        last.child = new ValidatorObject()
        last.child.name = name
        last.child.options = options
        last.child.changesValue = changesValue
        last.child.first(this.first())
        last.child.operation = function (value,options,callback) {  
            if (opt.debug) { console.log('>>'.green +  ' calling',name,'with',value) }
            helpers.forceCallback(function (callback) { 
                return validatorf(value,options,callback)
            }, function (err,data) { 
                if (opt.debug) { console.log('<<'.cyan +  ' got',err,data) }
                
                if (changesValue) { 
                    callback(err,data)
                } else {
                    callback(err,value) 
                }

            })
        }

        return this
    }
}


_.map(Validate,function (validatorf,name) { addFunctionToValidators(validatorf,name) })

addFunctionToValidators(function (value,options,callback) {
    if (!value) { value = options }
    callback(undefined,value)
},"Default",true)


var Validator = exports.Validator = function (options) { 
    var validator = new ValidatorObject() 
    validator.globalOptions = options || {}
    return validator
}



/*


var target = Validate(
    testdata,
    {
        bla = Validator.Insist().Boolean()
        bla = Validator.Default(false).Boolean()
    })

*/


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


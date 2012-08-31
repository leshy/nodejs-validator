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
var async = require('async')

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

Validate.Exists = function (value) {
    if (value === undefined) { 
        Validate.fail("got undefined")
    }
    return true
}

Validate.Url = "implement this plz" // this is a specialization of validate.format


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
                
                if (err && (err.constructor != Validate.Error)) {
                    err = new Validate.Error(err)
                }
                
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
    if (!value) { 
        if (options.constructor == Function) {
            helpers.forceCallback(options,callback)
        } else {
            value = options 
            callback(undefined,value)
        }
    } else {
        callback(undefined,value)
    }
    
},"Default",true)

addFunctionToValidators(function (value,options,callback) {
    if (!value ||  (value.constructor != Object)) { callback(Validate.fail("Need an object type in order to inspect children"),value); return }
    
    var functions = {}
    _.map(options,function (validator,property) {
        // syntax sugar
        if (validator.constructor != ValidatorObject) { validator = new Validator(validator) } 
        functions[property] = function (callback) { validator.feed(value[property],callback) }
    })
    
    async.parallel(functions,function (err,data) {
        if (err) { 
            callback(err) 
        } else {
            callback(undefined,_.extend(value,data))
        }
    })
    
}, "Children", true)



var Validator = exports.Validator = function (options) { 
    var validator = new ValidatorObject() 
    
    validator.globalOptions = {}
    if (!options) { return validator }
    
    // syntax sugar
    
    // insta-children validator!
    if (options.constructor == Object) {
        return validator.Children(object)
    }
    
    // insta one specific no arguments validator
    if (options.constructor == String) { 
        return (validator[options])()
    }

    // insta existance
    if (options === true) {
        return validator.Exists()
    }
}

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

// Copyright Teleportd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * fwk.js
 * 
 * This is a repository of helper functions available directly from
 * the pipes library object. These functions help adding methods to
 * Crockford style objects, and adds a few functionalities to the
 * Function, Array and String objects
 * 
 * WARNING: never add methods to the Object type as they would appear
 * in enumerations. The pipes fwk rely on the NON-EXISTENCE of such
 * extended method on the Object type.
 * 
 */

var crypto = require('crypto');

/**
 * method(that, name, method, _super)
 * Adds a method to the current object denoted by that and preserves
 * _super implementation (see Crockford)
 */
exports.method = function(that, name, method, _super) {
  if(_super) {
    var m = that[name];
    _super[name] = function() {
      return m.apply(that, arguments);
    };    
  }
  that[name] = method;    
};

/**
 * getter(that, name, obj, prop)
 * Generates a getter on the current object denoted by that
 */
exports.getter = function(that, name, obj, prop) {
  var getter = function() {
    return obj[prop];
  };
  that[name] = getter;
};

/**
 * setter(that, name, obj, prop)
 * Generates a setter on the current object denoted by that
 */
exports.setter = function(that, name, obj, prop) {
  var setter = function (arg) {
    obj[prop] = arg;
    return that;
  };  
  that['set' + name.substring(0, 1).toUpperCase() + name.substring(1)] = setter;
};

/**
 * responds(that, name)
 * Tests whether the object responds to a given function name
 */
exports.responds = function(that, name) {
    return (that[name] && typeof that[name] === 'function');
};

function defineProperty(obj, key, val) {
  Object.defineProperty(obj, key, {
    value: val,
    writable: true,
    configurable: true,
    enumerable: false
  });
}

/**
 * once()
 * Returns a function that will call the underlying function only once
 * whether it is called once or multiple times 
 */
defineProperty(Function.prototype, 'once', function() {
  var fn = this;
  var done = false;
  return function() {    
    if(!done) {
      args = Array.prototype.slice.call(arguments);
      done = true;
      fn.apply(null, args);
    }
  };
});

if (!Function.prototype.bind) {
  // The V8 .bind is much, much faster than this, only define this bind if it
  // does not exist.
  /**
   * bind()
   * The .bind method from Prototype.js
   */
  defineProperty(Function.prototype, 'bind', function() {
    var fn = this,
    args = Array.prototype.slice.call(arguments),
    object = args.shift();
    return function() {
      return fn.apply(object,
                      args.concat(Array.prototype.slice.call(arguments)));
    };
  });
}

/** 
 * remove(e)
 * Removes the element e from the Array, using the JS '===' equality
 */
exports.remove = function(that, e) {
  "use strict";
  
  if(that === void 0 || that === null || !Array.isArray(that))
    throw new TypeError();
  
  for(var i = that.length - 1; i >= 0; i--)
    if(e === that[i]) that.splice(i, 1);        
};


/**
 * unique()
 * Removes duplicate elements, using the JS '===' equality
 */
exports.unique = function(that) {
  "use strict";
  
  if(that === void 0 || that === null || !Array.isArray(that))
    throw new TypeError();
  
  var a = that.concat();
  for(var i = 0; i < a.length; i++) {
    for(var j = i+1; j < a.length; j++) {
      if(a[i] === a[j]) {
        a.splice(j, 1);
        j--;
      }
    }
  }
  return a;
};


/** 
 * shallow(that)
 * Shallow copy of the object that
 */
exports.shallow = function(that) {
  if(that == null || typeof(that) != 'object')
    return that;		
  var temp = new that.constructor();
  for(var key in that) {
    if(that.hasOwnProperty(key))
      temp[key] = that[key];		  
  }
  return temp;  
};

/** 
 * clone(that)
 * Deep copy of the object that
 */
exports.clone = function clone(that) {
  if(that == null || typeof(that) != 'object')
    return that;  
  var temp = new that.constructor();
  for(var key in that) {
    if(that.hasOwnProperty(key))
      temp[key] = clone(that[key]);  		  
  }
  return temp;
};

/** 
 * mkhash(that)
 * Generates a 'deep' hash that ignores properties starting with a '_'
 */
exports.mkhash = function(that) {
  var hash = crypto.createHash('sha1');
  for(var i in that) {		  
    if(i.charAt(0) !== '_' && that.hasOwnProperty(i)) {
      var str = JSON.stringify(that[i]);
      if(str)
        hash.update(str);	
    }
  }
  /** add args to update */
  for(var j = 1; j < arguments.length; j++)		  
    hash.update(arguments[j]);
  return hash.digest(encoding='hex');
};

/** 
 * forEach(that, fun)
 * Applies Array-like forEach to an object
 */
exports.forEach = function(that, fun /*, thisp */) {
    "use strict";
    
    if(that === void 0 || that === null)
      throw new TypeError();
    
    var t = Object(that);
    
    if(typeof fun !== "function")
      throw new TypeError();
    
    var thisp = arguments[2];
    for(var i in t) {
      if(t.hasOwnProperty(i)) {
        fun.call(thisp, t[i], i, t);
      }
    }  
};

/** 
 * trim() ltrim() rtrim()
 * String trim functions
 */
defineProperty(String.prototype, 'trim', function() {
  return this.replace(/^\s+|\s+$/g,"");
});
defineProperty(String.prototype, 'ltrim', function() {
  return this.replace(/^\s+/,"");
});
defineProperty(String.prototype, 'rtrim', function() {
  return this.replace(/\s+$/,"");
});

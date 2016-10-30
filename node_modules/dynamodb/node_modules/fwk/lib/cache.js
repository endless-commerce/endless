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

var base = require('./base.js');

/**
 * cache.js
 *
 * a cache implementation for javascript uses LRU as default algorithm to evict 
 * elements from the cache when it is full.
 * The cache does not expose a set method for caching value, to cache a value use the 
 * get function wich take as a parameter a closure (options.getter) to fetch the value
 * 
 * cache.get(key, { getter: getter,
 *                  evict: evict,
 *                  timeout: ... }, cb); // cb(err, value)
 *
 * These are the `getter` params:
 *     @param key to identify the value in the cache
 *     @param cb cb(error,value)
 * Example:
 *  var getter = function(key, cb) {
 *    // retrieves the value as value
 *    cb(null, value);
 *  };
 *
 * The `evict` function takes the value as parameter. Only the evict passed with the 
 * getter that has been used to retrieve the value is used at eviction. All subsequent 
 * evict passed when retrieving a cached value are *not* called.
 * These are the `evict` params:
 *     @param key the evicted key
 *     @param value the evicted value
 *
 * If a value is not in the cache and there is many conccurent get hits for it,
 * the closure is fired only once. That allows avoinding reddundant calls.
 * 
 * The structure of a cache element is the following:
 *     { date: 123456789,      // last access date to this cached element
 *       [value: ...,]         // the cached value
 *       timeout: 123456789,   // date at which to invalidate this cache element
 *       queue: [] }           // the queue of callbacks, empty if already cached
 *
 *
 * @extends {}
 *
 * @param spec {[size] [, interval] [, evict]}
 */
var cache = function(spec, my) {
  my = my || {};
  var _super = {};
  
  my.size = spec.size || 1000;
  my.interval = spec.interval || 100;
  my.cache = {};
  my.evict = spec.evict || 'LRU';
  
  my.modes = { LRU: 0,
               MRU: 1,
               RR: 2};
  
  //public
  var get;                      /* get(key [, options], cb); */
  var invalidate;               /* invalidate(key); */ 
  var count;                    /* count(); */
  
  //private
  var runloop;
  var evict = [];
  
  var that = {};
  
  /**
   * List of available eviction algorithms. The algorithms used is driven
   * by the current mode: 'LRU', 'MRU', or 'RR'
   * @param count the current cache size
   */
  //LRU (Least Recently Used) algo
  evict[0] = function(count) {
    while(count > my.size ) {
      var min = Date.now();
      var evct;
      for(var s in my.cache) {
        if(my.cache.hasOwnProperty(s)) {
          if(typeof my.cache[s].value !== 'undefined') {
            if(my.cache[s].date < min) {
              min = my.cache[s].date;
              evct = s;
            }
          }
        }
      }
      count--;
      if(typeof evct !== 'undefined') {
        invalidate(evct);
      }
    }
  };

  //MRU (Most Recently Used)
  evict[1] = function(count) {
    while(count > my.size) {
      var max = 0;
      var evct;
      for(var s in my.cache) {
        if(my.cache.hasOwnProperty(s)) {
          if(typeof mycache[s].value !== 'undefined') {
            if(my.cache[s].date > max) {
              max = my.cache[s].date;
              evct = s;
            }
          }
        }
      }
      count--;
      if(typeof evct !== 'undefined')
        invalidate(evct);
    }
  };

  //RR (Random and Replacement)
  evict[2] = function(count) {
    while(count > my.size) {
      var index = Math.floor(count * Math.random());
      var evct;
      for(var s in my.cache) {
        if(my.cache.hasOwnProperty(s)) {
          if(typeof mycache[s].value !== 'undefined') {
            if(count == index) 
              evct = s;
          }
        }
      }
      count--;
      if(typeof evct !== 'undefined')
        invalidate(evct);
    }
  };

  /**
   * This is the main cache function that lets user retrieve cached
   * values and set new value in the cache through the getter option.
   * @param key to identify the cached value
   * @param options {getter, timeout}
   *          getter: closure for getting the value to be cached
   *          evict: called when the value is evicted 
   *                 (the one passed when getter is used)
   *          timeout: absolute time to invalidate the value 
   * @param cb(err, value) the async callback to retrieve the value
   */ 
  get = function(key, options, cb) {
    if(typeof key !== 'string') return;
      
    if(typeof my.cache[key] !== 'undefined') {
      if(typeof my.cache[key].value !== 'undefined') {
        my.cache[key].date = Date.now();
        // returns the value
        cb(null, my.cache[key].value);
      } 
      else {
        my.cache[key].queue.push(cb);
      }

      // timeout comparison
      if(typeof options.timeout === 'number') {
        var t = Date.now() + options.timeout;
        if(typeof my.cache[key].timeout === 'undefined' ||
           my.cache[key].timeout > t) {
          my.cache[key].timeout = t;
        }
      }

      // we don't update evict here since the value is cached
      // only the evict passed with the getter that has been
      // used is called
    }
    else if(typeof options.getter === 'function') {
      my.cache[key] = { queue: [cb] };

      // timeout setting
      if(typeof options.timeout === 'number') {
        my.cache[key].timeout = Date.now() + options.timeout;
      }
      // evict setting
      if(typeof options.evict === 'function') {
        my.cache[key].evict = options.evict;
      }

      // getter asynchonous call
      options.getter(key, function(err, val) {
        if(!err && typeof val === 'undefined') {
          err = new Error('undefined val returned by getter');
        }
        
        var queue = my.cache[key].queue;

        if(!err) {
          my.cache[key].date = Date.now();
          my.cache[key].value = val; 
          delete my.cache[key].queue;
        }
        else {
          delete my.cache[key];
        }    
      
        queue.forEach(function(cb) {
          cb(err, val);
        });
      });
    }
    else {
      cb();
    }
  
    var count = that.count();
    if(count > my.size) {
      evict[my.modes[my.evict]](count);
    }
  };
 
  /**
   * Function for invalidating a value or more from the cache
   * given a key or a regex matching all the keys whose value
   * to be invalidated 
   * @param key {string or regex}
   */ 
  invalidate = function(key) {
    if(typeof key === "string") {
      if(my.cache[key] && typeof my.cache[key].value !== 'undefined') {
        var evct = my.cache[key].evict;
        var value = my.cache[key].value;
        delete my.cache[key];
        if(typeof evct === 'function') {
          evct(key, value);
        }
      }
      return;
    }

    //regex on whole map
    if(typeof key === "object" && key instanceof RegExp) {
      base.forEach(my.cache, function(v, k) {
        if(key.test(k) && typeof my.cache[k].value !== 'undefined') {
          var evct = my.cache[k].evict;
          var value = my.cache[k].value;
          delete my.cache[k]; 
          if(typeof evct === 'function') {
            evct(k, value);
          }
        }
      });
    }
    
    if(typeof key === "undefined") {
      base.forEach(my.cache, function(v, k) {
        if(typeof my.cache[k].value !== 'undefined') {
          var evct = my.cache[k].evict;
          var value = my.cache[k].value;
          delete my.cache[k]; 
          if(typeof evct === 'function') {
            evct(k, value);
          }
        }
      });
    }
  };

  /**
   * Calculates and returns the number of elements 
   * @return count the number of elements within the cache.
   */
  count = function() {
    var count = 0;
    for(var s in my.cache) {
      if(my.cache.hasOwnProperty(s)) {
        count ++;
      }
    }
    return count;
  };
  
  /**
   * Private Function for keeping the cash invalidate expired element at 
   * my.interval rate.
   */  
  runloop = function() {
    var now = Date.now();
    var expired = [];
    for(var s in my.cache) {
      if(my.cache.hasOwnProperty(s)) {
        if(typeof my.cache[s].timeout === "undefined" ||
           typeof my.cache[s].value === "undefined") 
          continue;
        
        if(now > my.cache[s].timeout) {
          expired.push(s);
        }
      }
    }
    
    for(var i = 0; i < expired.length; i ++) {
      invalidate(expired[i].key);
    }
  };
  
  setInterval(runloop, my.interval);
    
  base.method(that, 'get', get, _super);
  base.method(that, 'invalidate', invalidate, _super);
  base.method(that, 'count', count, _super);

  return that;
}

exports.cache = cache;

// Copyright Stanislas Polu
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

var util = require('util');
var base = require("./base.js");

/**
 * mplex.js
 * 
 * The mplex object allows to wait for k asynchronous operations before executing
 * a completion callback with a lightweight syntax
 * 
 * Example:
 * ===================================================
 *       var mplex = fwk.mplex({});
 * 
 *       for(...) {
 *         (function(htag, cb) {
 *            my.pipe.send(fwk.message({})
 *                      .setType('2w')
 *                      .setSubject('IOIDXD:SEARCH')
 *                      .addTarget(htag)
 *                      .setBody(q.json()),
 *                      function(err, hdr, res) {
 *                         ...
 *                         cb();
 *                      });
 *       }(htag, mplex.callback()));
 *    }
 *
 *       mplex.go(function() {
 *                  pump(now, pos + mod, mod * 2);
 *                });
 * ====================================================
 */

/**
 * A MPlex is an object that allows to trigger n callback functions and
 * get one callback only when all these functions have returned
 * 
 * @extends {}
 * 
 * @param spec {}
 */
var mplex = function(spec, my) {  
  my = my || {};
  var _super = {};

  var that = {};

  my.cb = function() {};

  my.done = 0;     // number of callbacks done
  my.wait = 0;     // number of callbacks waiting
  my.go = false;   // started?
  my.cbargs = [];
  
  // public
  var callback;  /* callback() returns a callback to wait on */
  var go;        /* go(cb) start waiting for generated callbacks */

  /* callback() 
   * returns a callback to wait on */
  callback = function() {
    my.wait ++;
    return function() {
      my.cbargs.push(arguments);
      my.wait --;
      my.done ++;
      if(my.wait === 0 && my.go)
	my.cb(my.cbargs);
    };
  };

  /* go(cb) 
   * start waiting for generated callbacks */
  go = function(cb) {
    if(cb === null || typeof cb === "undefined")
      throw new TypeError();
    my.cb = cb;
    my.go = true;
    if(my.wait === 0) {
      my.cb(my.cbargs);
    }
  };

  base.method(that, 'callback', callback);
  base.method(that, 'go', go);
  base.getter(that, 'cbargs', my, 'cbargs');

  return that;
};

exports.mplex = mplex;

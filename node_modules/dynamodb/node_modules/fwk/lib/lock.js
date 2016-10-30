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

var util = require('util');
var events = require('events');
var base = require("./base.js");

/**
 * lock.js
 * 
 * A lock implementation for javascript, useful in some precise case where
 * multiple asynchronous events or callbacks should be ordered.
 * Each lock is in fact a collection of locks based on the tags passed.
 */

/**
 * A Lock
 * 
 * @extends events.EventEmitter
 * 
 * @param spec {}
 */
var lock = function(spec, my) {
  my = my || {};
  var _super = {};

  my.wlock = {};
  my.rlock = {};
  
  var that = new events.EventEmitter();
  that.setMaxListeners(0);
  

  // public
  var rlock; /* rlock: acquires a read lock */
  var wlock; /* wlock: acquires a write lock */
  
  /** 
   * rlock(tag, function(unlock) {... unlock(); });
   * acquires a read lock then executes section
   */
  rlock = function(tag, section_) {
    if(!my.wlock[tag]) {
      if(!my.rlock[tag]) my.rlock[tag] = 0;
      my.rlock[tag]++;
      
      var unlock = function() {
	//util.debug('READ UNLOCK: ' + tag);
	process.nextTick( 
	  function() {
	    my.rlock[tag]--;
	    if(my.rlock[tag] < 0) {
	      my.rlock[tag] = 0;
	      util.debug('WARNING: lock.js rlock < 0 for ' + tag);	  
	    }	    	    
	    that.emit(tag);
	  });
      };
      /** read critical section */
      //util.debug('READ CRITICAL: ' + tag);
      section_(unlock);
    }
    else {
      that.once(tag, function() { rlock(tag, section_); });      
    }
  };
  
  /** 
   * wlock(tag, function(unlock) {... unlock(); });
   * acquires a write lock then executes section
   */
  wlock = function(tag, section_) {
    if(!my.rlock[tag] && !my.wlock[tag]) {
      my.wlock[tag] = 1;
      
      var unlock = function() {
	//util.debug('WRITE UNLOCK: ' + tag);
	process.nextTick( 
	  function() {
	    my.wlock[tag]--;
	    if(my.wlock[tag] !== 0) {
	      my.wlock[tag] = 0;
	      util.debug('WARNING: lock.js wlock !== 0 for ' + tag);	  
	    }	    	    
	    that.emit(tag);
	  });
      };	
      /** write critical section */
      //util.debug('WRITE CRITICAL: ' + tag);
      section_(unlock);
    }
    else {
      that.once(tag, function() { wlock(tag, section_); });
    }
  };

  
  base.method(that, 'rlock', rlock);
  base.method(that, 'wlock', wlock);  
  
  return that;
};

exports.lock = lock;

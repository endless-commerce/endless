var util = require('util');
/**
 * Test dependencies.
 */

var mplex  = require("../lib/mplex.js").mplex();
var should = require('should');

describe("unit:mplex", function() {
  
  it('callback and go', function(){
    var j = 0;
    for(var i = 0; i < 4; i++) {
      (function(cb) {
        setTimeout(function() {
          j++;
          cb();
        }, 1);
      })(mplex.callback());
  }
    mplex.go(function() {
      j.should.equal(4);
    });
  }); 
  
});

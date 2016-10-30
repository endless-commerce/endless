var util = require('util');
/**
 * Test dependencies.
 */

var lock  = require("../lib/lock.js").lock();
var should = require('should');

describe("unit:lock", function() {
  
  it('wlock', function(done){
    var i = 0;
    var j = 0;

    var unlock1, unlock2, unlock3;

    lock.wlock("rw", function(unlock) {
      i = 1;
      unlock1 = unlock; 
    });      
    
    lock.rlock("rw", function(unlock) {
      i = 2;
      unlock2 = unlock;
    });
   
   lock.rlock("rw", function(unlock) {
     j = 2;  
     unlock3 = unlock;
   }); 

   i.should.equal(1);
   unlock1();

    setTimeout(function() {
     i.should.equal(2);
     j.should.equal(2);
     unlock2();
     unlock3();
     done();
   }, 1);
  });
  
});

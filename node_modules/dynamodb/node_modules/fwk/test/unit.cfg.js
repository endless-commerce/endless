var util = require('util');
/**
 * Test dependencies.
 */

var should = require('should');
var cfg = require("../lib/cfg.js").populateConfig(require("./resources/config/config.js").config);

describe("unit:cfg", function() {

 it('should be world', function() {
   cfg["WORLD"].should.equal("world");
 }); 
  
});

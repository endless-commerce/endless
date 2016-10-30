var util = require('util');
/**
 * Test dependencies.
 */

var base = require("../lib/base.js");
var should = require('should');

describe("unit:base", function() {
  
  it('method1', function(){
    
    var that = {};
    var _super = {};
    
    var hello = function() {
      return "hello";  
    }

    base.method(that, "hello", hello, _super);

    that.hello.should.be.an.instanceOf(Function);
    that.hello().should.equal("hello");

  }); 
  
  it('method2', function(){
    var _super = {};

    var that = { hello: function() {
      return "salut";
    }};
    
    
    var hello = function() {
      return "hello";  
    };
    
    base.method(that, "hello", hello, _super);

    _super.hello.should.be.an.instanceOf(Function);
    _super.hello().should.equal("salut");
    that.hello().should.equal("hello");

  });   
  
  it('getter', function(){
    var my = {};
    var _super = {};

    var that = {};
    
    my.hello = "hello";  
    
    base.getter(that, "hello", my, "hello");

    that.hello().should.equal("hello");
  }); 
  
  it('setter', function(){
    var my = {};
    var _super = {};

    var that = {};
    
    my.name = "Bob";  
    
    base.setter(that, "name", my, "name");
    
    my.name.should.equal("Bob");
    
    that.setName("Alice");

    my.name.should.equal("Alice");

  }); 
  
  it('responds', function(){
    var that = {};
    
    that.hello = function() {
      return "hello";
    };
    
    base.responds(that, "hello").should.equal(true);
    
  }); 
  
  it('responds', function(){
     var that = {};
    
    that.hello = function() {
      return "hello";
    };
     
     base.responds(that, "hello").should.equal(true);
    
   }); 
  
   it('remove', function(){
     var myarray = [1, 2, 3, "helloo"];
     
     base.remove(myarray, "helloo");
     
     myarray.length.should.equal(3);    
     myarray[0].should.equal(1);    
     myarray[1].should.equal(2);    
     myarray[2].should.equal(3);    
     
   }); 
  
   it('unique', function(){
     var myarray = [1, 2, 3, "helloo", 2, 3, 1];
     
     myarray = base.unique(myarray);
     
     myarray.length.should.equal(4);    
     myarray[0].should.equal(1);    
     myarray[1].should.equal(2);    
     myarray[2].should.equal(3);    
     myarray[3].should.equal("helloo");    
     
   }); 

  it('shallow', function(){
    
    var that = {};
    var shallowcopy;

    that.hello = function() {
      return "hello";
    };
    
    that.level1_0 = {bonjour: "bonjour"};
    
    that.level1 = {};
    that.level1.level2_0 = {salut: "salut"};

    shallowcopy = base.shallow(that);
    
    that.level1_0.bonjour = "Good morning";
    that.level1.level2_0.salut = "hello";
        
    shallowcopy.hello().should.equal("hello");
    
    shallowcopy.level1_0.bonjour.should.equal("Good morning");
    shallowcopy.level1.level2_0.salut.should.equal("hello");
    
  });

  it('clone', function(){
    
    var that = {};
    var deepcopy;
    
    that.hello = function() {
      return "hello";
    };
    
    that.level1_0 = {bonjour: "bonjour"};
    
    that.level1 = {};
    that.level1.level2_0 = {salut: "salut"};

    deepcopy = base.clone(that);
    
    that.level1_0.bonjour = "Good morning";
    that.level1.level2_0.salut = "hello";
        
    deepcopy.hello().should.equal("hello");
    
    deepcopy.level1_0.bonjour.should.equal("bonjour");
    deepcopy.level1.level2_0.salut.should.equal("salut");
    
   });
  
  
  it("foreach", function() {
    var that = {};
    
    that.one = 0;
    that.two = 1;
    that.three = 2;
    
    base.forEach(that, function(v, k) {
      that[k] = v + 1;
    });
    
    that.one.should.equal(1);
    that.two.should.equal(2);
    that.three.should.equal(3);
    
  });

  it("trim", function() {
    var that = "   hello   ";
    that.trim().should.equal("hello");
    that.rtrim().should.equal("   hello");
    that.ltrim().should.equal("hello   ");
  });

});

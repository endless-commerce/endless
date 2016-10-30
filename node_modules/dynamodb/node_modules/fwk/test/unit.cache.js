/**
 * Test dependencies.
 */

var should = require('should');
var util = require('util');

describe("unit:cache", function() {
  
  before(function(){
    cache = require("../lib/cache.js").cache({ interval: 1,
                                               evict: 'LRU',
                                               size: 3 });
  });

  it('should return cached value', function(done){
    //used to assert the getter got called
    var called = false;
    var numcall = 0;

    var getter = function(key, cb) {
      var blockingMock = {hello : "world"};
      called = true;
      cb(null, blockingMock[key]);
      numcall++;
      if(numcall > 1)
        throw new Error('getter called on supossedly cached value');
    };

    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert cache miss
                           true.should.equal(called);
                           called = false;
                         });


    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert cache hit
                           false.should.equal(called);
                           done();
                         });
  }); 
  
  
  it('should hit the cache two times, testing timeout', function(done){
    //used to assert the getter got called
    var called = false;
    
    var getter = function(key, cb) {
      var blockingMock = {hello : "world"};
      called = true;
      cb(null, blockingMock[key]);
    };
    
    cache.invalidate();
    
    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert cache hit
                           true.should.equal(called);
                           called = false;
                         });
    
    setTimeout(function() {
      cache.get("hello", { getter: getter,
                           timeout: 2}, function(err, val) {
                             should.equal(val, "world");
                             //assert cache hit
                             true.should.equal(called);
                             called = false;
                             done();
                           });
    }, 5);
  });
  
  //many concurrent hits
  it('should do one cache hit', function(done) {
    var called = false;
    var getter = function(key, cb) {
      var blockingMock = {hello : "world"};
      called = true;
      cb(null, blockingMock[key]);
    };
    
    cache.invalidate();
    
    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert cache hit
                           true.should.equal(called);
                           called = false;
                         });

    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert no cache hit
                           false.should.equal(called);
                         });
    
    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert no cache hit
                           false.should.equal(called);
                         });
    
    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert no cache hit
                           false.should.equal(called);
                           done();
                         }); 
  });
  
  it('should invalidate keys staring with "h" ', function(done) {
    var called = false;
    var getter = function(key, cb) {
      var blockingMock = {hello : "world"};
      called = true;
      cb(null, blockingMock[key]);
    };
    
    cache.invalidate();
    
    cache.get("hello", { getter: getter,
                         timeout: 2}, function(err, val) {
                           should.equal(val, "world");
                           //assert cache hit
                           true.should.equal(called);
                           called = false;
                         }); 
    var re = /^h/;
    cache.invalidate(re);
    
    cache.get("hello", { getter: getter,
                         timeout:2}, function(err, val) {
                           should.equal(val, "world");
                           //assert cache hit
                           true.should.equal(called);
                           called = false;
                           done();
                         });
    // test w/ 3 values 2 matching one non matching
  });

  it("fill the cache, delayed getter ", function(done) {
    
    var getter = function(key, cb) {
      var blockingMock = [0, 1, 2, 3, 4];
      setTimeout(function() {
        cb(null, blockingMock[parseInt(key, 10)]); 
      }, 5);
    };
    
    cache.invalidate();
    
    for(var i = 0; i < 5 ; i++) {
      (function(i) {
        setTimeout(function() {
          cache.get(i.toString(), { getter: getter }, function(err, val) {
            should.equal(val, i);
            if(i == 4) {
              done();
            }
          });
        }, i);
      })(i);
    }
    
  });

  it("invalidate just after doing a get with delay ", function(done) {
    
    var getter = function(key, cb) {
      var blockingMock = {"hello": "world"};
      setTimeout(function() {
        cb(null, blockingMock[key]); 
      }, 5);
    };
    
    cache.invalidate();
    
    cache.get("hello", { getter: getter }, function(err, val) {
      should.equal(val, "world");
      done();
    });
    
    cache.invalidate("hello");
    
  });
  
  it("invalidate whole cache just after doing a get with delay ", function(done) {
    
    var getter = function(key, cb) {
      var blockingMock = {"hello": "world"};
      setTimeout(function() {
        cb(null, blockingMock[key]); 
      }, 5);
    };
    
    cache.invalidate();
    
    cache.get("hello", { getter: getter }, function(err, val) {
      should.equal(val, "world");
      done();
    });
    
    cache.invalidate();
    
  });

  
  it("invalidate cache elements who match a regex just after doing a get with delay ", function(done) {
    
    var getter = function(key, cb) {
      var blockingMock = {"hello": "world"};
      setTimeout(function() {
        cb(null, blockingMock[key]); 
      }, 5);
    };
    
    cache.invalidate();
    
    cache.get("hello", { getter: getter }, function(err, val) {
      should.equal(val, "world");
      done();
    });
    
    cache.invalidate(/^hel/);
    
  });

  it("call the eviction callback when an element is invalidated", function(done) {
    cache.invalidate();
    
    cache.get("hello", { getter: function(key, cb) {
                           cb(null, "world-evict");
                         }, 
                         evict: function() {
                           done();
                         }
                        }, function(err, val) {
                          should.equal(val, "world-evict");
                        });
    
    cache.invalidate();
  });

  it("call only the evict passed when the getter is used when an element is invalidated", function(done) {
    cache.invalidate();

    cache.get("hello", { getter: function(key, cb) {
                           cb(null, "world-evict");
                         }, 
                         evict: function() { done(); }
                       }, function(err, val) {
                         should.equal(val, "world-evict");
                       });
    cache.get("hello", { getter: function(key, cb) {
                           cb(null, "world-evict");
                         }, 
                         evict: function() { throw new Error('wrong evict!'); }
                       }, function(err, val) {
                         should.equal(val, "world-evict");
                       });

    cache.invalidate();
  });


  it("assert an element is removed from the cache after invalidating it", function(done) {
    
    var called = false;

    var getter = function(key, cb) {
      var blockingMock = {"hello": "world"};
      setTimeout(function() {
        called = true
        cb(null, blockingMock[key]); 
      }, 5);
    };
      
    cache.invalidate();
    
    cache.get("hello", { getter: getter }, function(err, val) {
      should.equal(true, called);
      called = false;
      should.equal(val, "world");
      cache.invalidate();
    });
    
    setTimeout(function() {
      cache.get("hello", { getter: getter }, function(err, val) {
        should.equal(true, called);
        should.equal(val, "world");
        done();
      });}, 10);
    
  });

  
  describe("LRU",function() {
    it('should invalidate least recently used element when the cache is full', function(done){
      //used to assert the getter got called
      var called = false;
      
      var getter = function(key, cb) {
        var blockingMock = {
          hello : "world",
          France: "Paris",
          Germany: "Berlin",
          UK: "London"
        };
        called = true;
        cb(null, blockingMock[key]);
      };
      
      cache.invalidate();
      
      cache.get("hello", { getter: getter },
                function(err, val) {
                  should.equal(val, "world");
                  //assert cache hit
                  should.equal(called, true);
                  called = false;
                });
      
      setTimeout(function() {
        cache.get("France", { getter: getter},
                  function(err, val) {
                    should.equal(val, "Paris");
                    //assert cache hit
                    should.equal(called, true);
                    called = false;
                  });
        
        cache.get("Germany", { getter: getter},
                  function(err, val) {
                    should.equal(val, "Berlin");
                    //assert cache hit
                    should.equal(called, true);
                    called = false;
                  });
        
        cache.get("UK", { getter: getter},
                  function(err, val) {
                    should.equal(val, "London");
                    //assert cache hit
                    should.equal(called, true);
                    called = false;
                  });
        
        cache.get("hello", { getter: getter },
                  function(err, val) {
                    should.equal(val, "world");
                    //assert cache hit
                    should.equal(called, true);
                    done();
                  });
      }, 5);
    });

    it('should call the least recently used evict method when the cache is full', function(done){
      //used to assert the getter got called
      var called = false;
      
      var getter = function(key, cb) {
        var blockingMock = {
          hello : "world",
          France: "Paris",
          Germany: "Berlin",
          UK: "London"
        };
        called = true;
        cb(null, blockingMock[key]);
      };
      
      cache.invalidate();
      
      cache.get("hello", { getter: getter,
                           evict: function() { done(); } },
                function(err, val) {
                  should.equal(val, "world");
                  //assert cache hit
                  should.equal(called, true);
                  called = false;
                });
      
      setTimeout(function() {
        cache.get("France", { getter: getter},
                  function(err, val) {
                    should.equal(val, "Paris");
                    //assert cache hit
                    should.equal(called, true);
                    called = false;
                  });
        
        cache.get("Germany", { getter: getter},
                  function(err, val) {
                    should.equal(val, "Berlin");
                    //assert cache hit
                    should.equal(called, true);
                    called = false;
                  });
        
        cache.get("UK", { getter: getter},
                  function(err, val) {
                    should.equal(val, "London");
                    //assert cache hit
                    should.equal(called, true);
                    called = false;
                  });
        
        cache.get("hello", { getter: getter },
                  function(err, val) {
                    should.equal(val, "world");
                    //assert cache hit
                    should.equal(called, true);
                  });
      }, 5);
      
    });

  });    
});

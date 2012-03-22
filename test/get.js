describe('Get', function() {
  'use strict';

  var client = gazel.createClient();

  var isTrue = function(done) {
    return function(truthy) {
      done(assert.ok(truthy, 'Not the case'));
    };
  };

  var setGet = function(done, key, value, test) {
    client.set(key, value, function(res) {
      client.get(key, function(val) {
        isTrue(done)(test(res, val));
      });
    });
  };

  it('should return ints when set as ints', function(done) {
    var val = 45;
    setGet(done, 'foo', val, function(setRep, getRep) {
      return getRep === val;
    });
  });

  it('should return bools when set as bools', function(done) {
    var val = false;
    setGet(done, 'foo', val, function(setRep, getRep) {
      return getRep === val;
    });
  });

  it('should return objects when set as objects', function(done) {
    var obj = {
      fee: 'fi'
    };

    setGet(done, 'boo', obj, function(setRep, getRep) {
     return _.isEqual(getRep, obj); 
    });
  });
});

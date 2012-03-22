describe('Incr/Decr', function() {
  'use strict';

  var client = gazel.createClient();

  var set = function(key, value, then) {
    client.set(key, value, function(res) {
      if(res !== 'OK') {
        done(new Error('Set value is not OK'));  

        return;
      }

      then(res);
    });
  };
  
  it('incr should increment a set value by 1', function(done) {
    client.set('foo', 1, function(err) {
      if(err !== 'OK') {
        done(new Error());
      }

      client.incr('foo', function(res) {
        done(assert.equal(res, 2));
      });
    });
  });

  it('incrby should increment by value told', function(done) {
    client.set('foo', 1, function(err) {
      if(err !== 'OK') {
        done(new Error());
      }

      client.incrby('foo', 13, function(res) {
        done(assert.equal(res, 14));
      });
    });
  });

  it('decr should decrement value by 1', function(done) {
    set('foo', 1, function() {
      client.decr('foo', function(res) {
       done(assert.equal(res, 0)); 
      });
    });
  });

  it('decrby should decrement by given amount', function(done) {
    set('foo', 5, function() {
      client.decrby('foo', 6, function(res) {
        done(assert.equal(res, -1));
      });
    });
  });

  it('incr should set value to 1 if value not existant', function(done) {
    client.del('notexists', function(resp) {
      client.incr('notexists', function(res) {
        done(assert.equal(res, 1));
      });
    });
  });

  it('should return error if incrementing string', function(done) {
    var errClient = gazel.createClient();

    errClient.on('error', function(msg) {
      done(assert.ok(true));
    });

    set('foo', 'bar', function() {
      errClient.incr('foo', function(res) {
        done(assert.ok(false, 'We should not get here.'));
      });
    });
  });

  it('should return error if incrementing decimal', function(done) {
    var decClient = gazel.createClient();

    decClient.on('error', function(msg) {
      done(assert.ok(true));
    });

    decClient.incrby('foo', 2.3, function(res) {
      done(assert.ok(false, 'We should not get here.'));
    });
  });
});

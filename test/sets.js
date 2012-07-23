describe('Sets', function() {
  'use strict';

  var client = gazel.createClient(),
      SET_KEY = 'set:foo',
      ADDS_COUNT = 3;

  /*
  * Clean up by deleting any existing keys that might be in the data store.
  */
  before(function(done) {
    client.del(SET_KEY, function() {
      done();
    });
  });

  client.on('error', function(err) {
    throw err;
  });

  it('Adding a member should always return OK.', function(done) {
    var val = 'foo:' + Date.now().toString();

    client.sadd(SET_KEY, val, function(res) {
      done(assert.equal(res, 'OK', 'Values do not match.'));
    });
  });

  it('Retrieving all members should return an array.', function(done) {
    client.smembers(SET_KEY, function(members) {
      done(assert.equal(Array.isArray(members), true, 'Members is not an array.'));
    });
  });

  it('Should return undefined for a set that doesn\'t exist.', function(done) {
    var key = 'foo:' + Date.now().toString();

    client.smembers(key, function(members) {
      done(assert.ok(typeof members === 'undefined'));
    });
  });

  it('Should return only strings as the members.', function(done) {
    client.sadd(SET_KEY, Date.now(), function() {
      client.smembers(SET_KEY, function(members) {
        var nonString = members.some(function(member) {
          return typeof member !== 'string';
        });

        done(assert.equal(nonString, false, 'There is a non-string member.'));
      });
    });
  });

  it('Colons should be preserved when added.', function(done) {
    var val = 'foo:' + Date.now().toString();

    client.sadd(SET_KEY, val, function() {
      client.sismember(SET_KEY, val, function(isMember) {
        done(assert.equal(isMember, true, 'The value is not a member of the set.'));
      });
    });
  });

  it('Scard should retrieve a count of the members in a set.', function(done) {
    client.scard(SET_KEY, function(cnt) {
      assert.equal(cnt, ADDS_COUNT, 'Count is not correct.');
      done();
    });
  });

});
describe('Set', function() {
  'use strict';

  var client = gazel.createClient(),
      SET_KEY = 'set:foo';

  client.on('error', function(err) {
    throw err;
  });

  it('Adding a member that doesn\'t exist should return 1.', function(done) {
    var val = 'foo:' + Date.now().toString();

    client.sadd(SET_KEY, val, function(res) {
      done(assert.equal(res, 1, 'Values do not match.'));
    });
  });

  it('Adding a member that does exist should return 0.', function(done) {
    var val = 'exists';

    client.sadd(SET_KEY, val, function() {
      client.add(SET_KEY, val, function(res) {
        done(assert.equal(res, 0, 'Values do not match.'));
      });
    });
  });

});
describe('Sets speed', function() {
  this.timeout(0);

  var client = gazel.createClient(),
      SET_KEY = 'set:speed';

  /*
  * Clean up by deleting any existing keys that might be in the data store.
  */
  before(function(done) {
    client.sdel(SET_KEY, function() {
      client.multi();
      for(var i = 0; i < 10000; i++) {
        client.sadd(SET_KEY, i);
      }
      client.exec(function() {
        done();
      });
    });
  });

  client.on('error', function(err) {
    throw err;
  });

  it('Should be able to get the count of members in less than 500ms', function(done) {
    var MIN_SPEED = 500,
        start = Date.now();

    client.scard(SET_KEY, function(cnt) {
      var end = Date.now();
          diff = start - end;

      assert.ok(diff < MIN_SPEED, 'Too slow');
    });
  });
});

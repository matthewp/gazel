describe('Set', function() {

  var isOk = function(done) {
    return function(res) {
      done(assert.equal(res, 'OK', 'Did not return OK!'));
    };
  };

  var client;
  before(function() {
    client = gazel.createClient();
  });

  maxInt = 9007199254740992;

  it('should always return OK for strings', function(done) {
    client.set('foo', 'bar', function(res) {
      isOk(done)(res); 
    });
  });

  it('should always return OK for ints', function(done) {
    client.set('foo', 155, isOk(done));
  });

  it('should always return OK for truthy bools', function(done) {
    client.set('foo', true, isOk(done));
  });

  it('should always return OK for falsey bools', function(done) {
    client.set('foo', false, isOk(done));
  });

  it('should always accept the max int', function(done) {
    client.set('foo', maxInt, function() {
      client.get('foo', function(res) {
        done(assert.equal(res, maxInt, 'Not the max int!'));
      });
    });
  });

  it('should always accept an object', function(done) {
    var obj = {
      foo: 'bar',
      fee: function() { return 'fo'; }
    };
      
    client.set('fee', obj, isOk(done));
  });
});

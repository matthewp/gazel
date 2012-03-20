describe('Set', function() {

  var client;

  before(function() {
    client = gazel.createClient();
  });


  it('should set a value', function(done) {
    
    client.set('foo', 'bar', function(res) {
      done(assert.ok(true));
    });
  });
});

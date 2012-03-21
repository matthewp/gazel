describe('Multi', function() {
  'use strict';

  var results;
  before(function(done) {
    var client = gazel.createClient();

    client.multi()
      .set('Fee', 1)
      .set('Fi', 2)
      .set('Fo', 3)
      .set('Fum', 4)
      .incrby('Fee', 10)
      .del('Fi', 'Fo', 'Fum')
      .get('Fee')
      .exec(function(res) {
        results = res;
        done();
      });
  });

  it('should be a result for each operation.', function(done) {
    done(assert.equal(results.length, 7));
  });

  it('all sets should be OK.', function(done) {
    var sets = _.first(results, 4);
    var allOk = _.all(sets, function(res) {
      return res[0] === 'OK';
    });

    done(assert.ok(allOk, 'Not all sets returned with OK.'));
  });

  it('gets should be affected by sets, incrs', function(done) {
    var fee = _.last(results)[0];

    done(assert.equal(fee, 11));
  });
  

});

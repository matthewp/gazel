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

  it('discarded transactions should always return OK', function(done) {
    var mClient = gazel.createClient();

    mClient.multi()
      .get('foo')
      .discard(function(res) {
        done(assert.equal(res, 'OK'));
      });
  });

  it('created items should be gone when discarded.', function(done) {
    var mClient = gazel.createClient(),
        multi = mClient.multi();

    multi.set('m_1', 1)
      .set('m_2', 1)
      .set('m_3', 1)
      .discard(function(res) {
        done(assert.equal(res, 'OK'));
      });
  });

  it('previous values should roll back after a discard.', function(done) {
    var mClient = gazel.createClient();

    mClient.set('m_p_1', 1, function(setRes) {
      if(setRes !== 'OK') {
        done(assert.ok(false, 'Initial set didn\'t take.'));
        return;
      }

      mClient.multi()
        .set('m_p_2', 1)
        .incr('m_p_1')
        .discard(function(res) {
          var isOK = res === 'OK',
              noTrans = mClient.trans.count() === 0;

          done(assert.ok(isOK && noTrans));
        });
    });
  });

});

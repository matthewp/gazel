describe('Del', function() {
  'use strict';

  var client = gazel.createClient();

  var setDel = function(done) {
    return function(key, value, comparer) {
      client.set(key, value, function(res) {
        if(res !== 'OK') {
          done(assert.ok(false, 'Value not set.'));
          return;
        }

        client.del(key, function(res) {
          done(assert(comparer(res)));
        });
      });
    };
  }

  it('deletes a key if it exists', function(done) {
    setDel(done)('foo', 'bar', function(res) {
      return res === 1;
    });
  });

  it('doesn\'t delete non-existing keys', function(done) {
    // Delete it once to clear clutter.
    client.del('unreal', function(first) {
      client.del('unreal', function(sec) {
        done(assert.equal(sec, 0));
      });
    });
  });

  it('deletes multiple keys if given', function(done) {
    var keys = [ 'del_one', 'del_two', 'del_three' ];
    var mClient = gazel.createClient(),
        multi = mClient.multi();

    keys.forEach(function(key) {
      multi.set(key, 1);
    });

    multi.exec(function(res) {
      var allOk = _.all(res, function(arr) {
        return arr[0] === 'OK';
      });

      if(!allOk) {
        done(assert.ok(false, 'Not all keys set correctly.'));
        return;
      }

      mClient.del('del_one', 'del_two', 'del_three', function(res) {
        done(assert.equal(res, 3));
      });
    });
  });
});

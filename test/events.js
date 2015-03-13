import gazel from "gazel";
import chai from "chai";

const assert = chai.assert;

describe('Events', function() {
  var ok = function(done, msg){
    return done(assert.ok(true, msg));
  };

  var withClient = function(callback){
    var client = gazel.createClient();
    return function(done){
      callback(client, done);
    };
  };

  var key = function() { return 'foo' + new Date; };
  var noop = function(){};

  it('Should get a "set" event when setting.', withClient(function(client, done){
    var k1 = key(), v1 = 'bar';
    client.on('set', function(k, v){
      assert.equal(k1, k, 'Key returned.');
      assert.equal(v1, v, 'Value returned.');
      done();
    });

    client.set(k1, v1, noop);
  }));

  it('Should get a "delete" event when deleting.', withClient(function(client, done){
    var k1 = key(), k2 = key();
    var k1ev = false, k2ev = false;
    client.on('delete', function(k){
      if(k === k1) k1ev = true;
      if(k === k2) k2ev = true;

      if(k1ev && k2ev) {
        ok(done, 'Delete event was emitted.');
      }
    });

    client.multi()
      .set(k1, 'foo')
      .set(k2, 'bar')
      .del(k1, k2)
      .exec(noop);
  }));

  it('Should get a "set" event when incrementing.', withClient(function(client, done){
    var k = key(), times = 0;

    client.on('set', function(){
      times++;
      if(times === 3) {
        ok(done, 'Set event was emitted');
      }
    });

    client.multi()
      .incr(k)
      .incr(k)
      .incr(k)
      .exec(noop);
  }));

  it('Should get a "set" event when decrementing.', withClient(function(client, done){
    var k = key(), times = 0;
    client.on('set', function(){
      times++;
      if(times == 2) {
        ok(done, 'Set event was emitted.');
      }
    });

    client.multi()
      .decr(k)
      .decr(k)
      .exec(noop);
  }));
});

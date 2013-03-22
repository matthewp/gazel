Client.prototype.incrby = function(key, increment, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    var errback = self.handleError.bind(self),
        osName = gazel.osName,
        trans = self.trans;

    getKey(osName, trans, uuid, key, function(val) {
      val = val || 0;

      if(!isInt(val)) {
        errback('ERROR: Cannot increment a non-integer value.');

        return;
      }

      var newValue = val + increment;
      setValue(osName, trans, uuid, key, newValue, function(res) {
        cb.call(self, res === 'OK' ? newValue : 'ERR');
      }, errback, self);
    }, errback, self, IDBTransaction.READ_WRITE);
  }, callback);

  return this;
};

Client.prototype.incr = function(key, callback) {
  return this.incrby(key, 1, callback);
};

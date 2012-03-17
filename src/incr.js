Client.prototype.incrby = function(key, increment, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, uuid, IDBTransaction.READ_WRITE);
      var os = tx.objectStore(gazel.osName);
      (function curl(val) {
        if(!val) {
          var req = os.get(key);
          req.onerror = self.handleError.bind(self);
          req.onsuccess = function(e) {
          curl(e.target.result);
          };

          return;
        }
     
        var value = val + increment;
        var req = os.put(value, key);
        req.onerror = self.handleError.bind(self);
        req.onsuccess = function (e) {
          cb.call(self, e.target.result);
        };

      })();

    }, self.handleError.bind(self));
  }, callback);

  return this;
};

Client.prototype.incr = function(key, callback) {
  return this.incrby(key, 1, callback);
};

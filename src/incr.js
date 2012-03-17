Client.prototype.incr = function(key, by, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.get(uuid);
      if(!tx) {
        var tx = db.transaction([gazel.osName], IDBTransaction.READ_WRITE);
        tx.onerror = onerror;

        self.trans.set(uuid, tx);
      }

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
     
        var value = val + by;
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

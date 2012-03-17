Client.prototype.set = function(key, value, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.get(uuid);
      if(!tx) {
        var tx = db.transaction([gazel.osName], IDBTransaction.READ_WRITE);
        tx.onerror = onerror;

        self.trans.set(uuid, tx);
      }

      var req = tx.objectStore(gazel.osName).put(value, key);
      req.onerror = self.handleError.bind(self);
      req.onsuccess = function (e) {
        cb.call(self, e.target.result);
      };

    }, self.handleError.bind(self));
  }, callback);

  return this;
};

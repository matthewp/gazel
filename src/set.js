Client.prototype.set = function(key, value, callback) {
  var self = this;

  this.register(function(cb) {
    openReadable(function(db) {

      var tx = self.trans.get('write', undefined);
      if(!tx) {
        var tx = db.transaction([gazel.osName], IDBTransaction.READ_WRITE);
        tx.onerror = onerror;

        self.trans.set('write', tx);
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

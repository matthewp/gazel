Client.prototype.set = function(key, value, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, uuid, IDBTransaction.READ_WRITE);
      
      var req = tx.objectStore(gazel.osName).put(value, key);
      req.onerror = self.handleError.bind(self);
      req.onsuccess = function (e) {
        cb.call(self, e.target.result);
      };

    }, self.handleError.bind(self));
  }, callback);

  return this;
};

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

    }, self.handleError.bind(self));
  }, callback);

  return this;
};

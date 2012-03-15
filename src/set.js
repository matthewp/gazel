Client.prototype.set = function(key, value, callback) {
  var self = this;

  this.register(function(cb) {
    openWritable(function(tx) {
      var req = tx.objectStore(gazel.osName).put(value, key);
      req.onerror = error;
      req.onsuccess = function (e) {
        cb.call(self, e.target.result);
      };
    }, self.handleError);
  }, callback);

  return this;
};

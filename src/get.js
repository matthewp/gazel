Client.prototype.get = function(key, callback) {
  var self = this;

  this.register(function(cb) {
    openReadable(function(tx) {

      var req = tx.objectStore(gazel.osName).get(key);
      req.onerror = self.handleError.bind(self);
      req.onsuccess = function (e) {
        cb.call(self, e.target.result);
      };
    }, self.handleError.bind(self));
  }, callback);

  return this;
};

Object.defineProperty(Client.prototype, 'get', {

  value: function(key, callback) {
    var self = this;

    this.register(function(cb) {
      openReadable(function(tx) {

        var req = tx.objectStore(gazel.osName).get(key);
        req.onerror = error;
        req.onsuccess = function (e) {
          cb.call(self, e.target.result);
        };
      }, self.handleError);
    }, callback);
  
    return this;
  },

  writable: true,

  enumerable: true,

  configurable: true

});

Object.defineProperty(Client.prototype, 'set', {

  value: function(key, value, callback) {
    var self = this;

    this.register(function(cb) {
      openWritable(function(tx) {
        var req = tx.objectStore(gazel.osName).put(value, key);
        req.onerror = error;
        req.onsuccess = function (e) {
          cb.call(self, e.target.result);
        };
      });
    });

    return this;
  },

  writable: true,

  enumerable: true,

  configurable: true

});


gazel.set = function (key, value, onsuccess) {
  var set = function () {
    var n = gazel.osName;
    openWritable(n, function (tx) {
      var req = tx.objectstore(n).put(value, key);
      req.onerror = error;
      req.onsuccess = function (e) {
        complete(onsuccess, [e.target.result]);
      };
    });
  };

  if (gazel._multi) {
    onsuccess = gazel._queue.flush.bind(gazel._queue);
    gazel._queue.add(set);
  } else {
    set();
  }

  return gazel;
};



Object.defineProperty(Client.prototype, 'incr', {

  value: function(key, by, callback) {
    this.register(function(cb) {
      this.get(key, function(val) {
        this.set(key, val + by, cb);
      });
    }, callback);

    return this;
  },

  writable: true,

  enumerable: true,

  configurable: true
});

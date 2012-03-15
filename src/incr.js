Client.prototype.incr = function(key, by, callback) {
  this.register(function(cb) {
    this.get(key, function(val) {
      this.set(key, val + by, cb);
    });
  }, callback);

  return this;
};

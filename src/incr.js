Client.prototype.incrby = function(key, increment, callback) {
  this.register(function(cb) {
    this.get(key, function(val) {
      this.set(key, val + increment, cb);
    });
  }, callback);

  return this;
};

Client.prototype.incr = function(key, callback) {
  return this.incrby(key, 1, callback);
};

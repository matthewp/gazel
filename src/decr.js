Client.prototype.decrby = function(key, increment, callback) {
  return this.incrby(key, -increment, callback);
};

Client.prototype.decr = function(key, callback) {
  return this.incrby(key, -1, callback);
};

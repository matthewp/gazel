Client.prototype.get = function(key, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    getKey(gazel.osName, self.trans, uuid, key, 
      cb, self.handleError.bind(self), self);
  }, callback);

  return this;
};

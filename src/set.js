Client.prototype.set = function(key, value, callback) {
  var self = this;
  var osName = gazel.osName;

  this.register('write', function(uuid, cb) {
    setValue(gazel.osName, self.trans, uuid, 
      key, value, cb, self.handleError.bind(self), self);
  }, callback);

  return this;
};

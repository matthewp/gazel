Client.prototype.del = function() {
  var self = this,
      args = slice.call(arguments),
      callback = args[args.length > 0 ? args.length - 1 : 0];

  if(typeof callback !== 'function')
    callback = undefined;
  else
    args.splice(args.length - 1);
  
  var keys = args;

  this.register('write', function(uuid, cb) {
    deleteKey(gazel.osName, self.trans, uuid, 
      keys, cb, self.handleError.bind(self), self);
  }, callback);

  return this;
};

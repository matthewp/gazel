Client.prototype.del = function() {
  var self = this,
      args = slice.call(arguments),
      callback = args[args.length > 0 ? args.length - 1 : 0];

  if(typeof callback !== 'function')
    callback = undefined;
  else
    args.splice(args.length - 1);
  
  var keys = args,
      deleted = keys.length;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {
     
      var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE),
          os = tx.objectStore(self.osName),
          left = keys.length;

      var del = function() {
        var key = keys.shift(),
            req = os.delete(key);
        req.onerror = self.handleError.bind(self);
        req.onsuccess = function(e) {
          left--;
          
          if(left === 0)
            cb.call(self, deleted);
        };
      };

      while(keys.length > 0) {
        del();  
      }
    });
  }, callback);

  return this;
};

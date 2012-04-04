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
    openDatabase(function(db) {
     
      var tx = self.trans.pull(db, uuid, IDBTransaction.READ_WRITE);
      
      var os = tx.objectStore(gazel.osName),
          left = keys.length,
          deleted = 0;

      while(keys.length > 0) {
        (function() {
          var key = keys.shift();
          var req = os.delete(key);
          req.onerror = self.handleError.bind(self);
          req.onsuccess = function(e) {
            left--;
            
            if(e.target.result) deleted++;
            
            if(left === 0)
              cb.call(self, deleted);
          };
        })();
     }
    });
  }, callback);

  return this;
};

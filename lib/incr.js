import exists from './exists';
import isInt from './is_int';
import { openDatabase } from './dbfunctions';

export function incrby(key, increment, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE);
      var os = tx.objectStore(self.osName);
      (function curl(val) {
        var req;
        if(!exists(val)) {
          req = os.get(key);
          req.onerror = self.handleError.bind(self);
          req.onsuccess = function(e) {
            curl(typeof e.target.result === 'undefined'
              ? 0 : e.target.result);
          };

          return;
        }

        if(!isInt(val)) {
          return self.handleError('ERROR: Cannot increment a non-integer value.');
        }
     
        var value = val + increment;
        req = os.put(value, key);
        req.onerror = self.handleError.bind(self);
        req.onsuccess = function (e) {
          var res = e.target.result === key ? value : "ERR";
          self.emit('set', key, value);
          cb.call(self, res);
        };

      })();

    }, self.handleError.bind(self));
  }, callback);

  return this;
};

export function incr(key, callback) {
  return this.incrby(key, 1, callback);
};

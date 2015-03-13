/*gazel@1.0.0#incr*/
define([
    'exports',
    './exists',
    './is_int',
    './dbfunctions'
], function (exports, _exists, _is_int, _dbfunctions) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    exports.incrby = incrby;
    exports.incr = incr;
    var exists = _interopRequire(_exists);
    var isInt = _interopRequire(_is_int);
    var openDatabase = _dbfunctions.openDatabase;
    function incrby(key, increment, callback) {
        var self = this;
        this.register('write', function (uuid, cb) {
            openDatabase(function (db) {
                var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE);
                var os = tx.objectStore(self.osName);
                (function curl(val) {
                    var req;
                    if (!exists(val)) {
                        req = os.get(key);
                        req.onerror = self.handleError.bind(self);
                        req.onsuccess = function (e) {
                            curl(typeof e.target.result === 'undefined' ? 0 : e.target.result);
                        };
                        return;
                    }
                    if (!isInt(val)) {
                        return self.handleError('ERROR: Cannot increment a non-integer value.');
                    }
                    var value = val + increment;
                    req = os.put(value, key);
                    req.onerror = self.handleError.bind(self);
                    req.onsuccess = function (e) {
                        var res = e.target.result === key ? value : 'ERR';
                        self.emit('set', key, value);
                        cb.call(self, res);
                    };
                }());
            }, self.handleError.bind(self));
        }, callback);
        return this;
    }
    ;
    function incr(key, callback) {
        return this.incrby(key, 1, callback);
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});

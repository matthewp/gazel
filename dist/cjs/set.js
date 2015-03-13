/*gazel@1.0.0#set*/
'use strict';
exports.set = set;
exports._set = _set;
var openDatabase = require('./dbfunctions.js').openDatabase;
function set(key, value, callback) {
    var self = this;
    this.register('write', this._set(key, value), callback);
    return this;
}
;
function _set(key, value) {
    var self = this;
    return function (uuid, cb) {
        openDatabase(function (db) {
            var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE);
            var req = tx.objectStore(self.osName).put(value, key);
            req.onerror = self.handleError.bind(self);
            req.onsuccess = function (e) {
                var res = e.target.result === key ? 'OK' : 'ERR';
                self.emit('set', key, value);
                cb.call(self, res);
            };
        }, self.handleError.bind(self));
    };
}
;
Object.defineProperty(exports, '__esModule', { value: true });

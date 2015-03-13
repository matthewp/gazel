/*gazel@1.0.0#get*/
define([
    'exports',
    './dbfunctions'
], function (exports, _dbfunctions) {
    'use strict';
    exports.get = get;
    var openDatabase = _dbfunctions.openDatabase;
    function get(key, callback) {
        var self = this;
        this.register('read', function (uuid, cb) {
            openDatabase(function (db) {
                var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_ONLY);
                var req = tx.objectStore(self.osName).get(key);
                req.onerror = self.handleError.bind(self);
                req.onsuccess = function (e) {
                    cb.call(self, e.target.result);
                };
            }, self.handleError.bind(self));
        }, callback);
        return this;
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});

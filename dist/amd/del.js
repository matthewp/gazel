/*gazel@1.0.0#del*/
define([
    'exports',
    './slice',
    './dbfunctions'
], function (exports, _slice, _dbfunctions) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    exports.del = del;
    exports._del = _del;
    var slice = _interopRequire(_slice);
    var openDatabase = _dbfunctions.openDatabase;
    function del() {
        var self = this, args = slice.call(arguments), callback = args[args.length > 0 ? args.length - 1 : 0];
        if (typeof callback !== 'function')
            callback = undefined;
        else
            args.splice(args.length - 1);
        this.register('write', this._del(args), callback);
        return this;
    }
    ;
    function _del(keys) {
        var self = this, deleted = keys.length;
        return function (uuid, cb) {
            openDatabase(function (db) {
                var tx = self.trans.pull(db, self.osName, uuid, IDBTransaction.READ_WRITE), os = tx.objectStore(self.osName), left = keys.length;
                var del = function () {
                    var key = keys.shift(), req = os['delete'](key);
                    req.onerror = self.handleError.bind(self);
                    req.onsuccess = function (e) {
                        left--;
                        self.emit('delete', key);
                        if (left === 0) {
                            cb.call(self, deleted);
                        }
                    };
                };
                while (keys.length > 0) {
                    del();
                }
            });
        };
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});

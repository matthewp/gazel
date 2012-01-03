var Ixdb = (function () {
    function Ixdb(osname) {
        this.osName = exists(osname) ? osname : "gazelos";
    };

    function _getDatabase(self, onsuccess, onerror) {
        if (exists(self._db) && exists(onsuccess)) {
            onsuccess(self._db);
        } else {
            var req = window.indexedDB.open(gazel.dbName);
            req.onsuccess = function (e) {
                self._db = e.target.result;
                if (exists(onsuccess)) { onsuccess(self._db); }
            };
            req.onerror = onerror;
        }
    };

    function _createObjectStore(self, db, onsuccess, onerror) {
        try {
            var req = db.setVersion(gazel.version);
            req.onerror = function (e) {
                _handleError(e.message, onerror);
            };
            req.onsuccess = function (e) {
                var store;
                var tx = e.target.result;
                tx.onerror = function (e) {
                    _handleError(e.message, onerror);
                };
                tx.oncomplete = function (e) {
                    if (exists(onsuccess)) { onsuccess(store); }
                };
                store = db.createObjectStore(self.osName);
            };
        } catch (ex) { _handleError(ex, onerror); }
    };

    function _getObjectStore(self, onsuccess, onerror, accessLevel) {
        var get = function (db) {
            var tx = db.transaction([self.osName], accessLevel);
            tx.onerror = onerror;
            try {
                var os = tx.objectStore(self.osName);
                if (exists(onsuccess)) { onsuccess(os); }
            } catch (ex) { _handleError(ex, onerror); }
        };

        _getDatabase(self, function (db) {
            if (db.objectStoreNames.contains(self.osName)) { get(db); }
            else {
                _createObjectStore(self, db, function () {
                    get(db);
                }, onerror);
            }
        }, onerror);
    };

    function _handleError(err, onerror) {
        console.log(err);
        if (exists(onerror)) {
            if (typeof err === "Error") { onerror(err); }
            else {
                var mErr = new Error(err);
                onerror(mErr);
            }
        }
    };

    Ixdb.prototype.get = function (key, onsuccess, onerror) {
        var self = this;
        var save = function (db) {
            var req = db.transaction(self.osName).objectStore(self.osName).get(key);
            req.onerror = function (e) {
                _handleError(e, onerror);
            };
            req.onsuccess = function (e) {
                if (exists(onsuccess)) {
                    onsuccess(e.target.result);
                }
            };
        };

        _getDatabase(self, function (db) {
            if (db.objectStoreNames.contains(self.osName)) { save(db); }
            else {
                _createObjectStore(self, db, function () {
                    save(db);
                }, onerror);
            }
        }, onerror);
    };

    Ixdb.prototype.set = function (key, value, onsuccess, onerror) {
        var save = function (os) {
            var req = os.put(value, key);
            req.onsuccess = function (e) {
                if (exists(onsuccess)) {
                    onsuccess();
                }
            }
            req.onerror = function (e) {
                _handleError(e, onerror);
            }
        };

        _getObjectStore(this, save, onerror, IDBTransaction.READ_WRITE);
    };

    return Ixdb;
})();

Ixdb.create = function () { return new Ixdb; };


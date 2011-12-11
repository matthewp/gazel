(function () {
    /// <reference path="utils.js"/>

    var DATABASE_NAME = "Envelopely";

    var DataStore = DataStore || {};
    DataStore = (function () {
        function DataStore(storeName, version) {
            if(!Object.exists(storeName) || !Object.exists(version)) {
                throw "Error: Must provide store and version.";
            }

            this.StoreName = storeName;
            this.Version = version;
        }

        function _getDatabase(ds, onsuccess, onerror) {
            if (Object.exists(ds.Database) && Object.exists(onsuccess)) {
                onsuccess(ds.Database);
            } else {
                var ixDB = window.indexedDB || window.msIndexedDB || null;

                var req = ixDB.open(DATABASE_NAME);
                req.onsuccess = function (e) {
                    ds.Database = e.target.result;
                    if (Object.exists(onsuccess)) { onsuccess(ds.Database); }
                };
                req.onerror = onerror;
            }
        }

        function _createObjectStore(ds, db, onsuccess, onerror) {
            try {
                var req = db.setVersion(ds.Version);
                req.onerror = function (e) {
                    if (Object.exists(obj) && Object.exists(onerror)) { onerror(e.message); }
                };
                req.onsuccess = function (e) {
                    var store;
                    var tx = e.target.result;
                    tx.onerror = function (e) {
                        if (Object.exists(onerror)) { onerror(e.message); }
                    };
                    tx.oncomplete = function (e) {
                        if (Object.exists(onsuccess)) { onsuccess(store); }
                    };
                    store = db.createObjectStore(ds.StoreName);
                };
            } catch (ex) { if(Object.exists(onerror)) {onerror(ex);} }
        }

        function _getObjectStore(ds, onsuccess, onerror, accessLevel) {
            if (Object.exists(ds.ObjectStore) && Object.exists(onsuccess)) {
                onsuccess(ds.ObjectStore);
            } else {
                var get = function (db) {
                    var tx = db.transaction([ds.StoreName], accessLevel);
                    tx.onerror = onerror;
                    try {
                        var store = tx.objectStore(ds.StoreName);
                        if(Object.exists(onsuccess)) { onsuccess(store); }
                    } catch (ex) {
                        if (Object.exists(onerror)) { onerror(ex); }
                    }
                };

                _getDatabase(ds, function (db) {
                    if (db.objectStoreNames.contains(ds.StoreName)) { get(db); }
                    else {
                        _createObjectStore(ds, db, function () {
                            get(db);
                        }, onerror);
                    }
                }, onerror);
            }
        };

        DataStore.prototype.getAll = function (onsuccess, onerror) {
            var getAll = function (os) {
                var gotOS = "";
            };

            _getObjectStore(this, getAll, onerror, IDBTransaction.READ_ONLY);
        };

        DataStore.prototype.save = function (key, value, onsuccess, onerror) {
            var save = function (os) {
                var req = os.put(value, key);
                req.onsuccess = function (e) {
                    if (Object.exists(onsuccess)) {
                        onsuccess();
                    }
                }
                req.onerror = function (e) {
                    if (Object.exists(onerror)) {
                        onerror();
                    }
                }
            };

            _getObjectStore(this, save, onerror, IDBTransaction.READ_WRITE);
        };

        return DataStore;
    })();

    this.DataStore = DataStore;

}).call(this);
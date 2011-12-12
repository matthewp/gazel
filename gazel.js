(function () {
    'use strict';

    var _exists = function (obj) {
        return typeof obj !== "undefined" && obj !== null;
    };

    var gazel = gazel || {};
    gazel.version = "1.0";
    gazel.dbName = "gazeldb";

    window.indexedDB = window.indexedDB || window.mozIndexedDB
        || window.msIndexedDB || window.webkitIndexedDB || window.oIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;

    gazel.compatible = _exists(window.indexedDB) && _exists(window.localStorage)
        && _exists(window.IDBTransaction);

    var ixdb = ixdb || {};
    ixdb = (function () {
        var osName = "gazelos";
        ixdb.os = {};

        function _getDatabase(onsuccess, onerror) {
            if (_exists(ixdb._db) && _exists(onsuccess)) {
                onsuccess(ixdb._db);
            } else {
                var req = window.indexedDB.open(gazel.dbName);
                req.onsuccess = function (e) {
                    ixdb._db = e.target.result;
                    if (_exists(onsuccess)) { onsuccess(ixdb._db); }
                };
                req.onerror = onerror;
            }
        };

        function _createObjectStore(db, onsuccess, onerror) {
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
                        if (_exists(onsuccess)) { onsuccess(store); }
                    };
                    store = db.createObjectStore(osName);
                };
            } catch (ex) { _handleError(ex, onerror); }
        };

        function _getObjectStore(onsuccess, onerror, accessLevel) {
            if (_exists(ixdb.os[accessLevel]) && _exists(onsuccess)) {
                onsuccess(ixdb.os[accessLevel]);
            } else {
                var get = function (db) {
                    var tx = db.transaction([osName], accessLevel);
                    tx.onerror = onerror;
                    try {
                        ixdb.os[accessLevel] = tx.objectStore(osName);
                        if (_exists(onsuccess)) { onsuccess(ixdb.os[accessLevel]); }
                    } catch (ex) { _handleError(ex, onerror); }
                };

                _getDatabase(function (db) {
                    if (db.objectStoreNames.contains(osName)) { get(db); }
                    else {
                        _createObjectStore(db, function () {
                            get(db);
                        }, onerror);
                    }
                }, onerror);
            }
        };

        function _handleError(err, onerror) {
            console.log(err);
            if (_exists(onerror)) { onerror(err); }
        };

        /*DataStore.prototype.getAll = function (onsuccess, onerror) {
        var getAll = function (os) {
        var gotOS = "";
        };

        _getObjectStore(this, getAll, onerror, IDBTransaction.READ_ONLY);
        };*/

        ixdb.get = function (key, onsuccess, onerror) {
            var get = function (os) {
                try {
                    var val = os.get(key);
                    if (_exists(onsuccess)) { onsuccess(val); }
                } catch (ex) {
                    _handleError(ex, onerror);
                }
            };

            _getObjectStore(get, onerror, IDBTransaction.READ_ONLY);
        };

        ixdb.set = function (key, value, onsuccess, onerror) {
            var save = function (os) {
                var req = os.put(value, key);
                req.onsuccess = function (e) {
                    if (_exists(onsuccess)) {
                        onsuccess();
                    }
                }
                req.onerror = function (e) {
                    _handleError(e, onerror);
                }
            };

            _getObjectStore(save, onerror, IDBTransaction.READ_WRITE);
        };

        return ixdb;
    })();

    gazel.get = function (key, onsuccess, onerror) {
        /// <summary>Description</summary>
        /// <param name="key" type="String">Description</param>
        /// <param name="onsuccess" type="Function">Function to be called on success.</param>
        /// <param name="onerror" type="Function">Function to be called on error.</param>
        ixdb.get(key, onsuccess, onerror);
    };

    gazel.set = function (key, value, onsuccess, onerror) {
        /// <summary>Description</summary>
        /// <param name="key" type="String">Description</param>
        /// <param name="value" type="Object">Description</param>
        /// <param name="onsuccess" type="Function">Function to be called on success.</param>
        /// <param name="onerror" type="Function">Function to be called on error.</param>

        ixdb.set(key, value, onsuccess, onerror);
    };

    gazel.incr = function (key, by, onsuccess, onerror) {
        /// <summary>Description</summary>
        /// <param name="key" type="String">Description</param>
        /// <param name="by" type="Integer">Description</param>
        /// <param name="onsuccess" type="Function">Function to be called on success.</param>
        /// <param name="onerror" type="Function">Function to be called on error.</param>
    };

    this.gazel = gazel;

}).call(this);

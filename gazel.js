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
        };

        function _handleError(err, onerror) {
            console.log(err);
            if (_exists(onerror)) { onerror(err); }
        };

        ixdb.get = function (key, onsuccess, onerror) {
            var save = function (db) {
                var req = db.transaction(osName).objectStore(osName).get(key);
                req.onerror = function (e) {
                    _handleError(e, onerror);
                };
                req.onsuccess = function (e) {
                    if (_exists(onsuccess)) {
                        onsuccess(e.target.result);
                    }
                };
            };

            _getDatabase(function (db) {
                if (db.objectStoreNames.contains(osName)) { save(db); }
                else {
                    _createObjectStore(db, function () {
                        save(db);
                    }, onerror);
                }
            }, onerror);
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

    var Queue = function () { }
    Queue.prototype = (function () {
        return {
            items: [],
            results: [],
            add: function (action, params) {
                this.items.push({ "action": action, "params": params });
            },
            flush: function () {
                var args = Array.prototype.slice.call(arguments);
                if (args.length > 0) { this.results.push(args); }
                if (this.items.length > 0) {
                    var item = this.items.shift();
                    item.action.apply(null, item.params);
                }
            },
            clear: function () {
                this.items = [];
                this.results = [];
            }
        };
    })();
    Queue.create = function () { return new Queue; }

    var Client = function () { }
    Client.prototype = (function () {
        var events = {};
        var onerror = function (e) {
            var action = events["error"];
            if (_exists(action)) {
                action(e);
            }
        };

        var chaining = false;
        var queue = Queue.create();

        return {
            on: function (event, action) {
                events[event] = action;
            },

            get: function (key, onsuccess) {
                if (chaining) {
                    queue.add(ixdb.get, [key, queue.flush, onerror]);
                } else { ixdb.get(key, onsuccess, onerror); }
            },

            set: function (key, value, onsuccess) {
                ixdb.set(key, value, onsuccess, onerror);
            },

            incr: function (key, by, onsuccess) {
                var got = function (val) {
                    ixdb.set(key, val + by, onsuccess, onerror);
                };
                ixdb.get(key, got, onerror);
            },

            multi: function () {
                chaining = true;
            },

            exec: function (onsuccess) {
                chaining = false;
                queue.add(onsuccess, null);
                queue.flush();
            }
        };
    })();

    gazel.create = function () {
        return new Client;
    }

    this.gazel = gazel;

}).call(this);

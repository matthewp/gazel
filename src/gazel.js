(function () {
    'use strict';

    var exists = function (obj) {
        return typeof obj !== "undefined" && obj != null;
    };

    var gazel = gazel || {};
    gazel.version = "1.0";
    gazel.dbName = "gazeldb";

    window.indexedDB = window.indexedDB || window.mozIndexedDB
        || window.msIndexedDB || window.webkitIndexedDB || window.oIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;

    gazel.compatible = exists(window.indexedDB) && exists(window.localStorage)
        && exists(window.IDBTransaction);

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

    var Queue = (function () {
        function Queue(ctx) {
            this.ctx = ctx;
        };

        Queue.prototype.items = [];
        Queue.prototype.results = [];
        Queue.prototype.add = function (action, params) {
            this.items.push({ "action": action, "params": params });
        };
        Queue.prototype.flush = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args.length > 0) { this.results.push(args); }
            if (this.items.length > 0) {
                var item = this.items.shift();
                item.action.apply(this.ctx, item.params);
            }
        };
        Queue.prototype.clear = function () {
            this.items = [];
            this.results = [];
        };

        return Queue;
    })();
    Queue.create = function (ctx) { return new Queue(ctx); }

    var Client = (function () {
        function Client() {
            var self = this;
            this._events = {};
            this._onerror = function (e) {
                var action = self.events["error"];
                if (exists(action)) {
                    action(e);
                }
            };

            this._ixdb = Ixdb.create();

            this._chaining = false;
            this._queue = Queue.create(this);
        };

        Client.prototype.on = function (event, action) {
            this._events[event] = action;
        };

        Client.prototype.get = function (key, onsuccess) {
            if (this._chaining) {
                this._queue.add(this._ixdb.get, [key, this._queue.flush, this._onerror]);
                return this;
            } else { this._ixdb.get(key, onsuccess, this._onerror); }
        },

        Client.prototype.set = function (key, value, onsuccess) {
            if (this._chaining) {
                this._queue.add(this._ixdb.set, [key, value, this._queue.flush, this._onerror]);
                return this;
            } else { this._ixdb.set(key, value, onsuccess, this._onerror); }
        };

        Client.prototype.incr = function (key, by, onsuccess) {
            var self = this;
            var got = function (val) {
                self._ixdb.set(key, val + by, onsuccess, self._onerror);
            };
            this._ixdb.get(key, got, this._onerror);
        };

        Client.prototype.multi = function () {
            this._chaining = true;
            return this;
        };

        Client.prototype.exec = function (onsuccess) {
            this._chaining = false;
            this._queue.add(onsuccess, null);
            this._queue.flush();
        };

        return Client;
    })();
    gazel.create = function () { return new Client; }

    this.Gazel = gazel;

}).call(this);

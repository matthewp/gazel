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
	    if(exists(onerror)) {
	        if(typeof err === "Error") { onerror(err); }
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
            if (exists(action)) {
                action(e);
            }
        };

        var ixdb = Ixdb.create();

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

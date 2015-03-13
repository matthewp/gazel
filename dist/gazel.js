/*[global-shim]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = global.define && global.define.modules || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses only the exports objet
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.modules = modules;
	global.define.amd = true;
	global.System = {
		define: function(__name, __code){
			global.define = origDefine;
			eval("(function() { " + __code + " \n }).call(global);");
			global.define = ourDefine;
		}
	};
})({},window)
/*gazel@1.0.0#slice*/
define('gazel/slice', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    module.exports = Array.prototype.slice;
});
/*gazel@1.0.0#print*/
define('gazel/print', [
    'exports',
    'gazel/slice'
], function (exports, _slice) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    exports.print = print;
    var slice = _interopRequire(_slice);
    function print() {
        var args = slice.call(arguments);
        if (args.length === 0) {
            return;
        }
        (Array.isArray(args[0]) ? args[0] : [args[0]]).forEach(function (item) {
            console.log(item);
        });
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});
/*gazel@1.0.0#decr*/
define('gazel/decr', ['exports'], function (exports) {
    'use strict';
    exports.decrby = decrby;
    exports.decr = decr;
    function decrby(key, increment, callback) {
        return this.incrby(key, -increment, callback);
    }
    ;
    function decr(key, callback) {
        return this.incrby(key, -1, callback);
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});
/*gazel@1.0.0#dbfunctions*/
define('gazel/dbfunctions', ['exports'], function (exports) {
    'use strict';
    exports.openDatabase = openDatabase;
    exports.ensureObjectStore = ensureObjectStore;
    var db;
    var loadingDb = false;
    function openDatabase(onsuccess, onerror, onupgrade) {
        if (db && db.version == gazel.version && db.name === gazel.dbName) {
            onsuccess(db);
            return;
        }
        if (loadingDb) {
            setTimeout(function () {
                openDatabase(onsuccess, onerror);
            }, 100);
            return;
        }
        loadingDb = true;
        var req = window.indexedDB.open(gazel.dbName, gazel.version);
        req.onupgradeneeded = function (e) {
            var uDb = e.target.result;
            if (!uDb.objectStoreNames.contains(gazel.osName))
                uDb.createObjectStore(gazel.osName);
            if (onupgrade)
                onupgrade(uDb);
        };
        var reqSuccess;
        reqSuccess = req.onsuccess = function (e) {
            var sDb = e.target.result;
            if (sDb.setVersion && Number(sDb.version) !== gazel.version) {
                if (db)
                    db.close();
                var dbReq = sDb.setVersion(String(gazel.version));
                dbReq.onsuccess = function (e2) {
                    var e3 = {};
                    e3.target = {};
                    e3.target.result = e2.target.result.db;
                    req.onupgradeneeded(e3);
                    reqSuccess(e3);
                    return;
                };
                dbReq.onerror = onerror;
                dbReq.onfailure = onerror;
                dbReq.onblocked = onerror;
                return;
            }
            db = sDb;
            loadingDb = false;
            onsuccess(db);
        };
        req.onerror = function (err) {
            if (err && err.target.errorCode === 12) {
                gazel.version++;
                openDatabase(onsuccess, onerror, onupgrade);
                return;
            }
            onerror(err);
        };
        req.onblocked = onerror;
    }
    function ensureObjectStore(osName, callback, errback) {
        openDatabase(function (db) {
            if (!db.objectStoreNames.contains(osName)) {
                db.close();
                gazel.version++;
                ensureObjectStore(osName, callback, errback);
                return;
            }
            callback();
        }, errback, function (db) {
            if (!db.objectStoreNames.contains(osName)) {
                db.createObjectStore(osName);
            }
        });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
});
/*gazel@1.0.0#del*/
define('gazel/del', [
    'exports',
    'gazel/slice',
    'gazel/dbfunctions'
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
/*gazel@1.0.0#discard*/
define('gazel/discard', ['exports'], function (exports) {
    'use strict';
    exports.discard = discard;
    function discard(callback) {
        try {
            this.trans.abortAll();
            (callback || function () {
            })('OK');
        } catch (err) {
            this.handleError(err);
        }
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});
/*gazel@1.0.0#error*/
define('gazel/error', [
    'exports',
    'gazel/slice'
], function (exports, _slice) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    exports.handleError = handleError;
    var slice = _interopRequire(_slice);
    function handleError() {
        var args = ['error'].concat(slice.call(arguments));
        this.emit.apply(this, args);
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});
/*gazel@1.0.0#get*/
define('gazel/get', [
    'exports',
    'gazel/dbfunctions'
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
/*gazel@1.0.0#exists*/
define('gazel/exists', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    module.exports = function (obj) {
        return typeof obj !== 'undefined' && obj != null;
    };
});
/*gazel@1.0.0#is_int*/
define('gazel/is_int', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    module.exports = function (n) {
        return !isNaN(n) && n % 1 === 0;
    };
});
/*gazel@1.0.0#incr*/
define('gazel/incr', [
    'exports',
    'gazel/exists',
    'gazel/is_int',
    'gazel/dbfunctions'
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
/*gazel@1.0.0#set*/
define('gazel/set', [
    'exports',
    'gazel/dbfunctions'
], function (exports, _dbfunctions) {
    'use strict';
    exports.set = set;
    exports._set = _set;
    var openDatabase = _dbfunctions.openDatabase;
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
});
/*gazel@1.0.0#dict*/
define('gazel/dict', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    var _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps)
            Object.defineProperties(child, staticProps);
        if (instanceProps)
            Object.defineProperties(child.prototype, instanceProps);
    };
    var _classCallCheck = function (instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    };
    var Dict = function () {
            function Dict() {
                _classCallCheck(this, Dict);
                this.items = {};
            }
            _prototypeProperties(Dict, null, {
                prop: {
                    value: function prop(key) {
                        return ':' + key;
                    },
                    writable: true,
                    configurable: true
                },
                get: {
                    value: function get(key, def) {
                        var p = this.prop(key), k = this.items;
                        return k.hasOwnProperty(p) ? k[p] : def;
                    },
                    writable: true,
                    configurable: true
                },
                set: {
                    value: function set(key, value) {
                        var p = this.prop(key);
                        this.items[p] = value;
                        return value;
                    },
                    writable: true,
                    configurable: true
                },
                count: {
                    value: function count() {
                        return Object.keys(this.items).length;
                    },
                    writable: true,
                    configurable: true
                },
                has: {
                    value: function has(key) {
                        var p = this.prop(key);
                        return this.items.hasOwnProperty(p);
                    },
                    writable: true,
                    configurable: true
                },
                del: {
                    value: function del(key) {
                        var p = this.prop(key), k = this.items;
                        if (k.hasOwnProperty(p))
                            delete k[p];
                    },
                    writable: true,
                    configurable: true
                },
                keys: {
                    value: function keys() {
                        return Object.keys(this.items).map(function (key) {
                            return key.substring(1);
                        });
                    },
                    writable: true,
                    configurable: true
                }
            });
            return Dict;
        }();
    module.exports = Dict;
});
/*gazel@1.0.0#uuid*/
define('gazel/uuid', ['exports'], function (exports) {
    'use strict';
    exports.createUuid = createUuid;
    function createUuid(a, b) {
        for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
        return b;
    }
    Object.defineProperty(exports, '__esModule', { value: true });
});
/*gazel@1.0.0#trans*/
define('gazel/trans', [
    'exports',
    'module',
    'gazel/dict',
    'gazel/uuid'
], function (exports, module, _dict, _uuid) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    var _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps)
            Object.defineProperties(child, staticProps);
        if (instanceProps)
            Object.defineProperties(child.prototype, instanceProps);
    };
    var _inherits = function (subClass, superClass) {
        if (typeof superClass !== 'function' && superClass !== null) {
            throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass)
            subClass.__proto__ = superClass;
    };
    var _classCallCheck = function (instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    };
    var Dict = _interopRequire(_dict);
    var createUuid = _uuid.createUuid;
    var Trans = function (Dict) {
            function Trans() {
                _classCallCheck(this, Trans);
                if (Dict != null) {
                    Dict.apply(this, arguments);
                }
            }
            _inherits(Trans, Dict);
            _prototypeProperties(Trans, null, {
                add: {
                    value: function add() {
                        var uuid = createUuid();
                        this.set(uuid, undefined);
                        return uuid;
                    },
                    writable: true,
                    configurable: true
                },
                abortAll: {
                    value: function abortAll() {
                        var self = this, keys = self.keys();
                        keys.forEach(function (key) {
                            var tx = self.get(key);
                            if (tx)
                                tx.abort();
                            self.del(key);
                        });
                    },
                    writable: true,
                    configurable: true
                },
                pull: {
                    value: function pull(db, os, uuid, perm) {
                        var tx = this.get(uuid);
                        if (!tx) {
                            tx = db.transaction([os], perm);
                            tx.onerror = onerror;
                            this.set(uuid, tx);
                        }
                        return tx;
                    },
                    writable: true,
                    configurable: true
                }
            });
            return Trans;
        }(Dict);
    module.exports = Trans;
});
/*gazel@1.0.0#client*/
define('gazel/client', [
    'exports',
    'module',
    'gazel/decr',
    'gazel/del',
    'gazel/discard',
    'gazel/error',
    'gazel/get',
    'gazel/incr',
    'gazel/set',
    'gazel/dict',
    'gazel/trans',
    'gazel/dbfunctions',
    'gazel/slice'
], function (exports, module, _decr, _del2, _discard, _error, _get, _incr, _set2, _dict, _trans, _dbfunctions, _slice) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    var decr = _decr.decr;
    var decrby = _decr.decrby;
    var del = _del2.del;
    var _del = _del2._del;
    var discard = _discard.discard;
    var handleError = _error.handleError;
    var get = _get.get;
    var incr = _incr.incr;
    var incrby = _incr.incrby;
    var set = _set2.set;
    var _set = _set2._set;
    var Dict = _interopRequire(_dict);
    var Trans = _interopRequire(_trans);
    var ensureObjectStore = _dbfunctions.ensureObjectStore;
    var slice = _interopRequire(_slice);
    module.exports = Client;
    function Client() {
        this.chain = [];
        this.inMulti = false;
        this.returned = [];
        this.trans = new Trans();
        this.transMap = new Dict();
        this.events = new Dict();
    }
    var p = Client.prototype = {
            register: function (type, action, callback) {
                var uuid, self = this;
                if (this.needsOsVerification) {
                    ensureObjectStore(this.osName, function () {
                        self.needsOsVerification = false;
                        self.register(type, action, callback);
                    }, this.handleError.bind(this));
                    return;
                }
                if (this.inMulti) {
                    uuid = this.transMap.get(type);
                    if (!uuid) {
                        uuid = this.trans.add();
                        this.transMap.set(type, uuid);
                    }
                    this.chain.push({
                        uuid: uuid,
                        action: action
                    });
                    return;
                }
                uuid = self.trans.add();
                action(uuid, function () {
                    var args = slice.call(arguments);
                    self.trans.del(uuid);
                    (callback || function () {
                    }).apply(null, args);
                });
            },
            flush: function () {
                var args = slice.call(arguments) || [];
                this.returned.push(args);
                if (this.chain.length === 0) {
                    this.complete();
                    return;
                }
                var item = this.chain.shift();
                item.action.call(this, item.uuid, this.flush);
            },
            multi: function () {
                this.chain = [];
                this.inMulti = true;
                return this;
            },
            exec: function (callback) {
                this.inMulti = false;
                this.complete = function () {
                    var self = this, returned = this.returned;
                    this.complete = null;
                    this.chain = null;
                    this.returned = [];
                    this.transMap.keys().forEach(function (key) {
                        var uuid = self.transMap.get(key);
                        self.trans.del(uuid);
                    });
                    this.transMap = new Dict();
                    callback(returned);
                };
                var item = this.chain.shift();
                item.action.call(this, item.uuid, this.flush);
            },
            on: function (eventType, action) {
                var event = this.events.get(eventType);
                if (!event) {
                    event = [];
                    this.events.set(eventType, event);
                }
                event.push(action);
            },
            off: function (eventType, action) {
                if (!action) {
                    this.events.del(eventType);
                    return;
                }
                var event = this.events.get(eventType);
                event.splice(event.indexOf(action), 1);
            },
            emit: function (eventType) {
                var args = slice.call(arguments, 1), self = this;
                setTimeout(function () {
                    (self.events.get(eventType) || []).forEach(function (action) {
                        action.apply(null, args);
                    });
                });
            }
        };
    p.decr = decr;
    p.decrby = decrby;
    p.del = del;
    p._del = _del;
    p.discard = discard;
    p.handleError = handleError;
    p.get = get;
    p.incr = incr;
    p.incrby = incrby;
    p.set = set;
    p._set = _set;
});
/*gazel@1.0.0#polyfill*/
define('gazel/polyfill', function(require, exports, module) {
'format cjs';
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.msIndexedDB || window.webkitIndexedDB || window.oIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || 'readonly';
window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || 'readwrite';
});
/*gazel@1.0.0#gazel*/
define('gazel', [
    'exports',
    'gazel/print',
    'gazel/client',
    'gazel/exists',
    'gazel/polyfill'
], function (exports, _print, _client, _exists, _polyfill) {
    'use strict';
    var _interopRequire = function (obj) {
        return obj && obj.__esModule ? obj['default'] : obj;
    };
    var print = _print.print;
    var Client = _interopRequire(_client);
    var exists = _interopRequire(_exists);
    var gazel = {};
    gazel.dbName = 'gazeldb';
    gazel.osName = 'gazelos';
    var VERSION_KEY = '_gazel.version', version = localStorage[VERSION_KEY] && localStorage[VERSION_KEY] | 0 || 1;
    Object.defineProperty(gazel, 'version', {
        get: function () {
            return version;
        },
        set: function (v) {
            version = v;
            localStorage[VERSION_KEY] = v;
        }
    });
    gazel.compatible = exists(window.indexedDB) && exists(window.IDBTransaction);
    gazel.createClient = function (osName) {
        var client = new Client();
        client.osName = osName || gazel.osName;
        if (osName) {
            client.needsOsVerification = true;
        }
        return client;
    };
    window.gazel = gazel;
    exports['default'] = gazel;
    Object.defineProperty(exports, '__esModule', { value: true });
});

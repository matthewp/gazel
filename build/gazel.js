/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function() {
'use strict';
var gazel = gazel || {};

var exists = function (obj) {
  return typeof obj !== 'undefined' && obj != null;
};

window.indexedDB = window.indexedDB
  || window.mozIndexedDB
  || window.msIndexedDB
  || window.webkitIndexedDB
  || window.oIndexedDB;

window.IDBTransaction = window.IDBTransaction
  || window.webkitIDBTransaction;

function complete(func, params, context) {
  if (exists(func) && typeof func === "function") {
    func.apply(context || null, params);
  }
};

function error() { }
function Client() {

}

Client.prototype = {
  chain: null,

  inMulti: false,

  returned: [],

  events: { },

  register: function(action, callback) {
    if(this.inMulti) {
      this.chain.push(action);

      return;
    }

    action(callback || function(){});
  },

  flush: function() {
    var args = Array.prototype.slice.call(arguments) || [];

    this.returned.push(args);

    if(this.chain.length === 0) {
      this.complete();

      return;
    }

    this.chain.shift().call(this, this.flush);
  },

  multi: function() {
    this.chain = [];
    this.inMulti = true;

    return this;
  },

  exec: function(callback) {
    this.inMulti = false;

    this.complete = function() {
      var returned = this.returned;

      this.complete = null;
      this.chain = null;
      this.returned = [];

      callback(returned);
    };

    var action = this.chain.shift();
    action.call(this, this.flush);
  },

  on: function(eventType, action) {
    var event = this.events[eventType] = this.events[eventType] || [];
    event.push(action);
  }
};
Object.defineProperty(Client.prototype, 'handleError', {

  value: function() {
    var args = Array.prototype.slice.call(arguments);

    var actions = this.events['error'] || [];
    actions.forEach(function(action) {
      action.apply(null, args);
    });
  },

  writable: true,

  enumerable: true,

  configurable: true
});
Object.defineProperty(Client.prototype, 'get', {

  value: function(key, callback) {
    var self = this;

    this.register(function(cb) {
      openReadable(function(tx) {

        var req = tx.objectStore(gazel.osName).get(key);
        req.onerror = error;
        req.onsuccess = function (e) {
          cb.call(self, e.target.result);
        };
      }, self.handleError);
    }, callback);
  
    return this;
  },

  writable: true,

  enumerable: true,

  configurable: true

});
Object.defineProperty(Client.prototype, 'set', {

  value: function(key, value, callback) {
    var self = this;

    this.register(function(cb) {
      openWritable(function(tx) {
        var req = tx.objectStore(gazel.osName).put(value, key);
        req.onerror = error;
        req.onsuccess = function (e) {
          cb.call(self, e.target.result);
        };
      }, self.handleError);
    }, callback);

    return this;
  },

  writable: true,

  enumerable: true,

  configurable: true

});
Object.defineProperty(Client.prototype, 'incr', {

  value: function(key, by, callback) {
    this.register(function(cb) {
      this.get(key, function(val) {
        this.set(key, val + by, cb);
      });
    }, callback);

    return this;
  },

  writable: true,

  enumerable: true,

  configurable: true
});
gazel.print = function() {
  var args = Array.prototype.slice.call(arguments);
  if(args.length === 0)
    return;

  var items = args[0] instanceof Array ? args[0] : [args[0]];
  items.forEach(function(item) {
    console.log(item);
  });
};
gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.on = function (name, action) {
  gazel._events.push({
    name: name,
    action: action
  });

  return gazel;
};

gazel.createClient = function() {
  return new Client;
};

this.gazel = gazel;
var db;

function openDatabase(onsuccess, onerror) {
  if(db) {
    complete(onsuccess, [db]);
    return;
  }

  var req = window.indexedDB.open(gazel.dbName, gazel.version);
  
  req.onupgradeneeded = function (e) {
    db = e.target.result;

    if(!db.objectStoreNames.contains(gazel.osName))
      db.createObjectStore(gazel.osName);
  };

  req.onsuccess = function (e) {
    db = e.target.result;

    if (db.setVersion && Number(db.version) !== gazel.version) {
      var dbReq = db.setVersion(gazel.version);
      dbReq.onsuccess = function (e2) {
        e.target.result = e2.target.result.db;
        req.onupgradeneeded(e);
        req.onsuccess(e);
        
        return;
      };

      return;
    }

    complete(onsuccess, [db]);
  };

  req.onerror = onerror;
}

function openReadable(onsuccess, onerror) {
  openDatabase(function (db) {
    var tx = db.transaction([gazel.osName], IDBTransaction.READ);
    tx.onerror = onerror;
    complete(onsuccess, [tx]);
  }, onerror);
}

function openWritable(onsuccess, onerror) {
  openDatabase(function (db) {
    var tx = db.transaction([gazel.osName], IDBTransaction.READ_WRITE);
    tx.onerror = onerror;
    complete(onsuccess, [tx]);
  }, onerror);
}
}).call(this);

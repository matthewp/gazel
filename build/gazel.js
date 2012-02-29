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

function complete(func, params) {
  if (exists(func) && typeof func === "function") {
    func.apply(null, params);
  }
};

function error(e) {
  gazel._events.forEach(function (item) {
    if (item.name.toUpperCase() === "ERROR") {
      item.action(e);
    }
  });
};
function Client() {

}

Client.prototype = {
  chain: [],

  events: { },

  register: function(action) {
    if(this.chain.length > 0) {
      this.chain.push(action);

      return;
    }

    action(callback);
  },

  on: function(eventType, action) {
    var event = this.events[eventType] = this.events[eventType] || [];
    event.push(action);
  },

  set: function(key, value, callback) {
    this.register(function() {
      openReadable(function(os) {
        // TODO do stuff with objectStore
        callback();
      });
    });

    return this;
  }
};
function Queue() {

}

Queue.prototype = {
  items: [],

  results: [],

  add: function (action) {
    this.items.push(action);
  },

  complete: function () { },
  flush: function () {
    var args = Array.prototype.slice.call(arguments);
    if (args.length > 0) { this.results.push(args); }
    if (this.items.length > 0) {
      var action = this.items.shift();
      action();
    } else { // Complete, callback.
      var results = this.results;
      this.clear();
      this.complete(results);
    }
  },

  clear: function () {
    this.items = [];
    this.results = [];
  }
};

Queue.create = function () {
  return new Queue;
};
var db;

function openDatabase(osName, onsuccess) {
  if(db) {
    complete(onsuccess, [db]);
    return;
  }

  var req = window.indexedDB.open(gazel.dbName, gazel.version);
  
  req.onupgradeneeded = function (e) {
    db = e.target.result;

    if(!db.objectStoreNames.contains(osName))
      db.createObjectStore(osName);
  };

  req.onsuccess = function (e) {
    db = e.target.result;

    if (db.setVersion && Number(db.version) !== gazel.version) {
      var dbReq = db.setVersion(gazel.version);
      dbReq.onsuccess = function (e) {
        req.onupgradeneeded(e);
        req.onsuccess(e);
        
        return;
      };

      return;
    }

    complete(onsuccess, [db]);
  };

  req.onerror = error;
}

function openReadable(osName, onsuccess) {
  openDatabase(osName, function (db) {
    var tx = db.transaction([osName], IDBTransaction.READ);
    tx.onerror = error;
    complete(onsuccess, [tx]);
  });
}

function openWritable(osName, onsuccess) {
  openDatabase(osName, function (db) {
    var tx = db.transaction([osName], IDBTransaction.READ_WRITE);
    tx.onerror = error;
    complete(onsuccess, [tx]);
  });
}
gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB)
  && exists(window.localStorage)
  && exists(window.IDBTransaction);

gazel._events = [];
gazel._multi = false;
gazel._queue = Queue.create();

gazel.on = function (name, action) {
  gazel._events.push({
    name: name,
    action: action
  });

  return gazel;
};

gazel.get = function (key, onsuccess) {
  var get = function () {
    var n = gazel.osName;
    openReadable(n, function (tx) {
      var req = tx.objectStore(n).get(key);
      req.onerror = error;
      req.onsuccess = function (e) {
        complete(onsuccess, [e.target.result]);
      };
    });
  };

  if (gazel._multi) {
    onsuccess = gazel._queue.flush.bind(gazel._queue);
    gazel._queue.add(get);
  } else {
    get();
  }

  return gazel;
};

gazel.set = function (key, value, onsuccess) {
  var set = function () {
    var n = gazel.osName;
    openWritable(n, function (tx) {
      var req = tx.objectStore(n).put(value, key);
      req.onerror = error;
      req.onsuccess = function (e) {
        complete(onsuccess, [e.target.result]);
      };
    });
  };

  if (gazel._multi) {
    onsuccess = gazel._queue.flush.bind(gazel._queue);
    gazel._queue.add(set);
  } else {
    set();
  }

  return gazel;
};

gazel.incr = function (key, by, onsuccess) {
  var incr = function () {
    var n = gazel.osName;
    openWritable(n, function (tx) {
      var req = tx.objectStore(n).get(key);
      req.onerror = error;
      req.onsuccess = function (e) {
        var value = e.target.result += by;

        req = tx.objectStore(n).put(value, key);
        req.onerror = error;
        req.onsuccess = function (e) {
          complete(onsuccess, [e.target.result]);
        };
      };
    });
  };

  if (gazel._multi) {
    onsuccess = gazel._queue.flush.bind(gazel._queue);
    gazel._queue.add(incr);
  } else {
    incr();
  }

  return gazel;
};

this.gazel = gazel;
gazel.multi = function () {
  // Let gazel know that we are in a multi.
  gazel._multi = true;
  return gazel;
};

gazel.exec = function (complete) {
  // Finalize the execution stack.
  gazel._queue.complete = complete;
  gazel._queue.flush();
};

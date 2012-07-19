/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(undefined) {
var gazel = gazel || {};

var exists = function (obj) {
  return typeof obj !== 'undefined' && obj != null;
};

var isInt = function(n) {
  return !isNaN(n) && (n % 1 == 0);
};

window.indexedDB = window.indexedDB
  || window.mozIndexedDB
  || window.msIndexedDB
  || window.webkitIndexedDB
  || window.oIndexedDB;

window.IDBTransaction = window.IDBTransaction
  || window.webkitIDBTransaction;

window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || 'readonly';
window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || 'readwrite';

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

var slice = Array.prototype.slice,
    splice = Array.prototype.splice;
// Blantantly stolen from: https://gist.github.com/1308368
// Credit to LevelOne and Jed, js gods that they are.

function createUuid(
  a,b                // placeholders
){
  for(               // loop :)
      b=a='';        // b - result , a - numeric variable
      a++<36;        // 
      b+=a*51&52  // if "a" is not 9 or 14 or 19 or 24
                  ?  //  return a random number or 4
         (
           a^15      // if "a" is not 15
              ?      // genetate a random number from 0 to 15
           8^Math.random()*
           (a^20?16:4)  // unless "a" is 20, in which case a random number from 8 to 11
              :
           4            //  otherwise 4
           ).toString(16)
                  :
         '-'            //  in other cases (if "a" is 9,14,19,24) insert "-"
      );
  return b
 }
function Dict() {
  this.items = {};
}

Dict.prototype = {

  prop: function(key) {
    return ':' + key;
  },

  get: function(key, def) {
    var p = this.prop(key),
        k = this.items;

    return k.hasOwnProperty(p) ? k[p] : def;
  },

  set: function(key, value) {
    var p = this.prop(key);

    this.items[p] = value;

    return value;
  },

  count: function() {
    return Object.keys(this.items).length;
  },

  has: function(key) {
    var p = this.prop(key);

    return this.items.hasOwnProperty(p);
  },

  del: function(key) {
    var p = this.prop(key),
        k = this.items;

    if(k.hasOwnProperty(p))
      delete k[p];
  },

  keys: function() {
    return Object.keys(this.items).map(function(key) {
      return key.substring(1);
    });
  }

};
function Trans() {
  Dict.call(this);
}

Trans.prototype = Object.create(Dict.prototype);
Trans.prototype.constructor = Trans;

Trans.prototype.add = function() {
  var uuid = createUuid();
  this.set(uuid, undefined);

  return uuid;
};

Trans.prototype.abortAll = function() {
  var self = this,
      keys = self.keys();

  keys.forEach(function(key) {
    var tx = self.get(key);
    if(tx)
      tx.abort();

    self.del(key);
  });
};

Trans.prototype.pull = function(db, os, uuid, perm) {
  var tx = this.get(uuid);
  if(!tx) {
    tx = db.transaction([os], perm);
    tx.onerror = onerror;

    this.set(uuid, tx);
  }

  return tx;
};
function Client() {
  this.chain = [];
  this.inMulti = false;
  this.returned = [];

  this.trans = new Trans();
  this.transMap = new Dict();

  this.events = new Dict();
}

Client.prototype = {
  register: function(type, action, callback) {
    var uuid, self = this;

    if(this.inMulti) {
      uuid = this.transMap.get(type);
      if(!uuid) {
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

    action(uuid, function() {
      var args = slice.call(arguments);

      self.trans.del(uuid);

      (callback || function() { }).apply(null, args);
    });
  },

  flush: function() {
    var args = slice.call(arguments) || [];

    this.returned.push(args);

    if(this.chain.length === 0) {
      this.complete();

      return;
    }

    var item = this.chain.shift();
    item.action.call(this, item.uuid, this.flush);
  },

  multi: function() {
    this.chain = [];
    this.inMulti = true;

    return this;
  },

  exec: function(callback) {
    this.inMulti = false;

    this.complete = function() {
      var self = this,
          returned = this.returned;

      this.complete = null;
      this.chain = null;
      this.returned = [];

      this.transMap.keys().forEach(function(key) {
        var uuid = self.transMap.get(key);

        self.trans.del(uuid);
      });

      this.transMap = new Dict();

      callback(returned);
    };

    var item = this.chain.shift();
    item.action.call(this, item.uuid, this.flush);
  },

  on: function(eventType, action) {
    var event = this.events.get(eventType);
    if(!event) {
      event = [];
      this.events.set(eventType, event);
    }

    event.push(action);
  }
};
Client.prototype.discard = function(callback) {
  try {
    this.trans.abortAll();

    (callback || function(){})('OK');
  } catch(err) {
    this.handleError(err);
  }
};
Client.prototype.handleError = function() {
  var args = slice.call(arguments);

  (this.events.get('error') || [])
    .forEach(function(action) {
      action.apply(null, args);
    });
};
Client.prototype.get = function(key, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    getKey(gazel.osName, self.trans, uuid, key, 
      cb, self.handleError.bind(self), self);
  }, callback);

  return this;
};
Client.prototype.set = function(key, value, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    setValue(gazel.osName, self.trans, uuid, 
      key, value, cb, self.handleError.bind(self), self);
  }, callback);

  return this;
};
Client.prototype.incrby = function(key, increment, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    var errback = self.handleError.bind(self),
        osName = gazel.osName,
        trans = self.trans;

    getKey(osName, trans, uuid, key, function(val) {
      val = val || 0;

      if(!isInt(val)) {
        errback('ERROR: Cannot increment a non-integer value.');

        return;
      }

      var newValue = val + increment;
      setValue(osName, trans, uuid, key, newValue, function(res) {
        cb.call(self, res === 'OK' ? newValue : 'ERR');
      }, errback, self);

    }, errback, self, IDBTransaction.READ_WRITE);

  }, callback);

  return this;
};

Client.prototype.incr = function(key, callback) {
  return this.incrby(key, 1, callback);
};
Client.prototype.decrby = function(key, increment, callback) {
  return this.incrby(key, -increment, callback);
};

Client.prototype.decr = function(key, callback) {
  return this.incrby(key, -1, callback);
};
Client.prototype.del = function() {
  var self = this,
      args = slice.call(arguments),
      callback = args[args.length > 0 ? args.length - 1 : 0];

  if(typeof callback !== 'function')
    callback = undefined;
  else
    args.splice(args.length - 1);
  
  var keys = args;

  this.register('write', function(uuid, cb) {
    deleteKey(gazel.osName, self.trans, uuid, 
      keys, cb, self.handleError.bind(self), self);
  }, callback);

  return this;
};
Client.prototype.sadd = function(key, member, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    var errback = self.handleError.bind(self);

    getKey(gazel.osName, self.trans, uuid, key,
      function(members) {
        if(members && (member in members)) { // member already in set.
          cb.call(self, 'OK');

          return;
        } else if(!members) {
          members = [];
        }

        members.push(':' + member.toString());
        setValue(gazel.osName, self.trans, uuid,
          key, members, cb, errback, self);
      }, errback, self, IDBTransaction.READ_WRITE);

  }, callback);

  return this;
};

Client.prototype.smembers = function(key, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    getKey(gazel.osName, self.trans, uuid, key, function(values) {
      var members = values.map(function(value) {
        return value.split(':').splice(1).toString();
      });

      cb.call(self, members);
    }, self.handleError.bind(self), self);

  }, callback);

  return this;
};

Client.prototype.scard = function(key, callback) {
  this.smembers(key, function(members) {
    callback(members.length || 0);
  });

  return this;
};

Client.prototype.sismember = function(key, member, callback) {
  var self = this;

  if(typeof member !== 'string') {
    member = member.toString();
  }

  this.register('read', function(uuid, cb) {
    self.smembers(key, function(members) {
      var isMember = members.some(function(value) {
        return member === value;
      });

      cb.call(self, isMember);
    });


    var osKey = self._sGetMemberKey(key, value);

    getKey(gazel.setsOsName, self.trans, uuid, osKey, function(res) {
      cb(res !== undefined);
    }, self.handleError.bind(self), self);
  }, callback);

  return this;
};gazel.print = function() {
  var args = slice.call(arguments);
  if(args.length === 0)
    return;

  (args[0] instanceof Array ? args[0] : [args[0]])
    .forEach(function(item) {
      console.log(item);
    });
};
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";
gazel.setsOsName = "gazelos.sets";
gazel.version = 2;

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.createClient = function() {
  return new Client;
};

this.gazel = gazel;
var db;
var loadingDb = false;

function openDatabase(onsuccess, onerror, onupgrade) {
  if(db && db.version == gazel.version && db.name === gazel.dbName) {
    onsuccess(db);
    return;
  }

  if(loadingDb) {
    setTimeout(function() {
      openDatabase(onsuccess, onerror);
    }, 100);

    return;
  }
  loadingDb = true;

  var req = window.indexedDB.open(gazel.dbName, gazel.version);

  req.onupgradeneeded = function(e) {
    var uDb = e.target.result;

    if(!uDb.objectStoreNames.contains(gazel.osName)) {
      uDb.createObjectStore(gazel.osName);
    }

    if(!uDb.objectStoreNames.contains(gazel.setsOsName)) {
      var setsOs = uDb.createObjectStore(gazel.setsOsName);
      setsOs.createIndex("key", "key", { unique: false });
    }

    if(onupgrade)
      onupgrade(uDb);
  };

  var reqSuccess;
  reqSuccess = req.onsuccess = function (e) {
    var sDb = e.target.result;

    if (sDb.setVersion && Number(sDb.version) !== gazel.version) {
      if(db)
        db.close();

      var dbReq = sDb.setVersion(String(gazel.version));
      dbReq.onsuccess = function (e2) {
        var e3 = {}; e3.target = {};
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

  req.onerror = function(err) {
    if(err && err.target.errorCode === 12) {
      gazel.version++;
      openDatabase(onsuccess, onerror, onupgrade);

      return;
    }

    onerror(err);
  };
  req.onblocked = onerror;
}

function ensureObjectStore(osName, callback, errback) {
  openDatabase(function(db) {
    if(!db.objectStoreNames.contains(osName)) {
      db.close();
      gazel.version++;

      ensureObjectStore(osName, callback, errback);

      return;
    }

    callback();
  }, errback, function(db) {
    if(!db.objectStoreNames.contains(osName)) {
      db.createObjectStore(osName);
    }
  });
}

function getKey(osName, trans, uuid, key, callback, errback, context, perm) {
  openDatabase(function(db) {

    var tx = trans.pull(db, osName, uuid, perm || IDBTransaction.READ_ONLY);

    var req = tx.objectStore(osName).get(key);
    req.onerror = errback;
    req.onsuccess = function(e) {
      callback.call(context, e.target.result);
    };

  }, errback);
}

function setValue(osName, trans, uuid, key, value, callback, errback, context) {
  openDatabase(function(db) {

    var tx = trans.pull(db, osName, uuid, IDBTransaction.READ_WRITE);

    var req = tx.objectStore(osName).put(value, key);
    req.onerror = errback;
    req.onsuccess = function(e) {
      var res = e.target.result === key ? 'OK' : 'ERR';
      callback.call(context, res);
    };

  }, errback);
}

function deleteKey(osName, trans, uuid, keys, callback, errback, context) {
  openDatabase(function(db) {
     
    var tx = trans.pull(db, osName, uuid, IDBTransaction.READ_WRITE),
        os = tx.objectStore(osName),
        remaining = keys.length,
        deleted = keys.length;

    while(keys.length > 0) {
      (function() {
        var key = keys.shift();
        var req = os.delete(key);
        req.onerror = errback;
        req.onsuccess = function(e) {
          remaining--;

          if(remaining === 0){
            callback.call(context, deleted);
          }
        };
      })();
    }

  });
}

function transverseKeys(osName, trans, uuid, indexName, value, callback, errback, context, perm) {
  openDatabase(function(db) {
    
    var tx = trans.pull(db, osName, uuid, perm || IDBTransaction.READ_ONLY),
        idx = tx.objectStore(osName).index(indexName),
        keyRange = window.IDBKeyRange.only(value);

    idx.openCursor(keyRange).onsuccess = function(e) {
      var cursor = e.target.result;
      if(cursor) {
        if(callback.call(context, cursor.value)) {
          cursor.continue();
        }
      } else {
        callback.call(context);
      }
    };

  });
}
}).call(this);
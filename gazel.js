/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function() {
'use strict';
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

var slice = Array.prototype.slice,
    splice = Array.prototype.splice;
var Thing = Object.create(null);
Thing.create = function(proto, props, init) {
  if(typeof props === 'undefined'
      && typeof init === 'undefined'
      && !(proto instanceof Array))
    return Object.create(proto);
  else if(typeof props === 'boolean') {
    init = props;
    props = undefined;
  }

  if(!(proto instanceof Array))
    proto = [ proto ];

  var desc = {};
  for(var p in props) {
    desc[p] = {
      value: props[p],
      writable: true,
      enumerable: true,
      configurable: true
    };
  }

  var o, baseDesc = {}, base = proto.pop();
  do {
   var par = proto.pop();

   if(par) {
     var all = {};
     for(var p in base) {
      all[p] = base[p];

      baseDesc[p] = Object.getOwnPropertyDescriptor(all, p);
     }

     base = Object.create(par, baseDesc);
   }
  } while(proto.length > 0);

  o = Object.create(base, desc);

  if(init) {
    var args = Array.prototype.slice.call(arguments)
                .slice(typeof props === 'undefined' ? 2 : 3);

    o.init.apply(o, args);
  }
 
  return o;
};

if(typeof exports !== 'undefined')
  exports.create = Thing.create;
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
var Dict = Thing.create(Object.prototype, {
  
  init: function() {
    this.items = {};

    return this;
  },

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
});
var Trans = Thing.create(Dict, {

  add: function() {
    var uuid = createUuid();
    this.set(uuid, undefined);

    return uuid;
  },

  abortAll: function() {
    var self = this,
        keys = self.keys();

    keys.forEach(function(key) {
      var tx = self.get(key);
      if(tx)
        tx.abort();

      self.del(key);
    });
  },

  pull: function(db, uuid, perm) {
    var tx = this.get(uuid);
    if(!tx) {
      tx = db.transaction([gazel.osName], perm);
      tx.onerror = onerror;

      this.set(uuid, tx);
    }

    return tx;
  }
 
});
function Client() {
  this.chain = [];
  this.inMulti = false;
  this.returned = [];

  this.trans = Thing.create(Trans, true);
  this.transMap = Thing.create(Dict, true);

  this.events = Thing.create(Dict, true);
}

Client.prototype = {
  register: function(type, action, callback) {
    if(this.inMulti) {
      var uuid = this.transMap.get(type);
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

    var self = this,
        uuid = self.trans.add();

    action(uuid, function() {
      var args = slice.call(arguments);

      self.trans.del(uuid);

      (callback || function(){}).apply(null, args);
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

      this.transMap = Thing.create(Dict, true);

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
  var args = Array.prototype.slice.call(arguments);

  var actions = this.events.get('error') || [];
  actions.forEach(function(action) {
    action.apply(null, args);
  });
};
Client.prototype.get = function(key, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, uuid, IDBTransaction.READ);

      var req = tx.objectStore(gazel.osName).get(key);
      req.onerror = self.handleError.bind(self);
      req.onsuccess = function (e) {
        cb.call(self, e.target.result);
      };

    }, self.handleError.bind(self));

  }, callback);

  return this;
};
Client.prototype.set = function(key, value, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, uuid, IDBTransaction.READ_WRITE);
      
      var req = tx.objectStore(gazel.osName).put(value, key);
      req.onerror = self.handleError.bind(self);
      req.onsuccess = function (e) {
        var res = e.target.result === key ? 'OK' : 'ERR';
        cb.call(self, res);
      };

    }, self.handleError.bind(self));
  }, callback);

  return this;
};
Client.prototype.incrby = function(key, increment, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    openDatabase(function(db) {

      var tx = self.trans.pull(db, uuid, IDBTransaction.READ_WRITE);
      var os = tx.objectStore(gazel.osName);
      (function curl(val) {
        if(!exists(val)) {
          var req = os.get(key);
          req.onerror = self.handleError.bind(self);
          req.onsuccess = function(e) {
            curl(typeof e.target.result === 'undefined'
              ? 0 : e.target.result);
          };

          return;
        }

        if(!isInt(val)) {
          self.handleError('ERROR: Cannot increment a non-integer value.');

          return;
        }
     
        var value = val + increment;
        var req = os.put(value, key);
        req.onerror = self.handleError.bind(self);
        req.onsuccess = function (e) {
          var res = e.target.result === key ? value : "ERR";
          cb.call(self, res);
        };

      })();

    }, self.handleError.bind(self));
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
    openDatabase(function(db) {
     
      var tx = self.trans.pull(db, uuid, IDBTransaction.READ_WRITE);
      
      var os = tx.objectStore(gazel.osName),
          left = keys.length,
          deleted = 0;

      while(keys.length > 0) {

        (function() {

        var key = keys.shift();
        var req = os.delete(key);
        req.onerror = self.handleError.bind(self);
        req.onsuccess = function(e) {
          left--;
          
          if(e.target.result) deleted++;
          
          if(left === 0)
            cb.call(self, deleted);
        };
        })();
     }
    });
  }, callback);

  return this;
};
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

gazel.createClient = function() {
  return new Client;
};

this.gazel = gazel;
var db;
var loadingDb = false;

function openDatabase(onsuccess, onerror) {
  if(db) {
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
  
  req.onupgradeneeded = function (e) {
    var uDb = e.target.result;

    if(!uDb.objectStoreNames.contains(gazel.osName))
      uDb.createObjectStore(gazel.osName);
  };

  var reqSuccess;
  reqSuccess = req.onsuccess = function (e) {
    var sDb = e.target.result;

    if (sDb.setVersion && Number(sDb.version) !== gazel.version) {
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

  req.onerror = onerror;
}
}).call(this);

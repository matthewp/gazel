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
        deleted = keys.length,
        rm = function(key) {
          var req = os.delete(key);
          req.onerror = errback;
          req.onsuccess = function(e) {
            remaining--;

            if(remaining === 0){
              callback.call(context, deleted);
            }
          };
        };

    while(keys.length > 0) {
      rm(keys.shift());
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

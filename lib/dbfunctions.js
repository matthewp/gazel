var db;
var loadingDb = false;

export function openDatabase(onsuccess, onerror, onupgrade) {
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
  
  req.onupgradeneeded = function (e) {
    var uDb = e.target.result;

    if(!uDb.objectStoreNames.contains(gazel.osName))
      uDb.createObjectStore(gazel.osName);

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

export function ensureObjectStore(osName, callback, errback) {
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

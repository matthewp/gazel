function openDatabase(osName, onsuccess) {
  var db;

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

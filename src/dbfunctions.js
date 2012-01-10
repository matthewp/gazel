function openDatabase(osName, onsuccess) {
    var db;

    var req = window.indexedDB.open(gazel.dbName, gazel.version);
    req.onupgradeneeded = function () {
        var os = db.createObjectStore(osName);
    };
    req.onsuccess = function (e) {
        db = e.target.result;
        doUpgrade(db, osName, onsuccess);
    };
    req.onerror = error;
};

function openReadable(osName, onsuccess) {
    openDatabase(osName, function (db) {
        var tx = db.transaction([osName], IDBTransaction.READ);
        tx.onerror = error;
        complete(onsuccess, [tx]);
    });
};

function openWritable(osName, onsuccess) {
    openDatabase(osName, function (db) {
        var tx = db.transaction([osName], IDBTransaction.READ_WRITE);
        tx.onerror = error;
        complete(onsuccess, [tx]);
    });
};

function doUpgrade(db, osName, done) {
    if (db.setVersion && Number(db.version) !== gazel.version) {
        var req = db.setVersion(gazel.version);
        req.onsuccess = function (e) {
            var tx = e.target.result;
            if (!db.objectStoreNames.contains(osName)) {
                db.createObjectStore(osName);
            }
            complete(done, [db]);
        };
    } else {
        complete(done, [db]);
    }
};

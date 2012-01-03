function openDatabase(osName, onsuccess) {
    var db;

    var req = window.indexedDB.open(gazel.dbName, gazel.version);
    req.onsuccess = function (e) {
        db = e.target.result;
        complete(onsuccess, [db]);
    };
    req.onerror = error;
    req.onupgradeneeded = function () {
        var os = db.createObjectStore(osName);
    };
};

function openReadable(osName, onsuccess) {
    openDatabase(function (db) {
        var tx = db.transaction([osName], IDBTransaction.READ);
        tx.onerror = error;
        complete(onsuccess, [tx]);
    });
};

function openWritable(osName, onsuccess) {
    openDatabase(function (db) {
        var tx = db.transaction([osName], IDBTransaction.READ_WRITE);
        tx.onerror = error;
        complete(onsuccess, [tx]);
    });
};
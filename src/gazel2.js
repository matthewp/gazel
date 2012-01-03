gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB) && exists(window.localStorage)
    && exists(window.IDBTransaction);

gazel._events = [];

gazel.on = function (name, action) {
    gazel._events.push({
        name: name,
        action: action
    });

    return gazel;
};

gazel.get = function (key, onsuccess) {
    var n = gazel.osName;
    openReadable(n, function (tx) {
        var req = tx.objectStore(n).get(key);
        req.onerror = error;
        req.onsuccess = function (e) {
            complete(onsuccess, [e.target.result]);
        };
    });

    return gazel;
};

gazel.set = function (key, value, onsuccess) {
    var n = gazel.osName;
    openWritable(n, function (tx) {
        var req = tx.objectStore(n).put(value, key);
        req.onerror = error;
        req.onsuccess = function (e) {
            complete(onsuccess, [e.target.result]);
        };
    });

    return gazel;
};

gazel.incr = function (key, by, onsuccess) {
    var n = gazel.osName;
    openWritable(n, function (tx) {
        var req = tx.objectStore(n).get(key);
        req.onerror = error;
        req.onsuccess = function (e) {
            var value = e.target.result += by;

            req = tx.objectStore(n).put(value, key)
            req.onerror = error;
            req.onsuccess = function (e) {
                complete(onsuccess, [e.target.result]);
            };
        };
    });

    return gazel;
};

this.gazel = gazel;
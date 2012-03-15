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



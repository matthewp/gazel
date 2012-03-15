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



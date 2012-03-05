gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB)
  && exists(window.localStorage)
  && exists(window.IDBTransaction);

gazel._events = [];
gazel._multi = false;
gazel._queue = Queue.create();

gazel.on = function (name, action) {
  gazel._events.push({
    name: name,
    action: action
  });

  return gazel;
};

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

gazel.set = function (key, value, onsuccess) {
  var set = function () {
    var n = gazel.osName;
    openWritable(n, function (tx) {
      var req = tx.objectStore(n).put(value, key);
      req.onerror = error;
      req.onsuccess = function (e) {
        complete(onsuccess, [e.target.result]);
      };
    });
  };

  if (gazel._multi) {
    onsuccess = gazel._queue.flush.bind(gazel._queue);
    gazel._queue.add(set);
  } else {
    set();
  }

  return gazel;
};

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

gazel.print = function() {
  var args = Array.prototype.slice.call(arguments);
  if(args.length === 0)
    return;

  var items = args[0] instanceof Array ? args[0] : [args[0]];
  items.forEach(function(item) {
    console.log(item);
  });
};

gazel.createClient = function() {
  return new Client;
};

this.gazel = gazel;

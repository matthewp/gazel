gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.on = function (name, action) {
  gazel._events.push({
    name: name,
    action: action
  });

  return gazel;
};

gazel.createClient = function() {
  return new Client;
};

this.gazel = gazel;

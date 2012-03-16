gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.createClient = function() {
  return new Client;
};

this.gazel = gazel;

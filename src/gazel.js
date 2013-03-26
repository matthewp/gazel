gazel.dbName = "gazeldb";
gazel.osName = "gazelos";
gazel.setsOsName = "gazelos.sets";
gazel.version = 2;

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.createClient = function() {
  return new Client();
};

this.gazel = gazel;

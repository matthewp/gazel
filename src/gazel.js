gazel.version = 1;
gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.createClient = function(osName) {
  var client = new Client;
  client.osName = osName || gazel.osName;

  return client;
};

this.gazel = gazel;

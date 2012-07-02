gazel.dbName = "gazeldb";
gazel.osName = "gazelos";

var VERSION_KEY = "_gazel.version",
    version = localStorage[VERSION_KEY] && parseInt(localStorage[VERSION_KEY]) || 1;
Object.defineProperty(gazel, 'version', {
  
  get: function() {
    return version;
  },

  set: function(v) {
    version = v;
    localStorage[VERSION_KEY] = v;
  }

});

gazel.compatible = exists(window.indexedDB)
  && exists(window.IDBTransaction);

gazel.createClient = function(osName) {
  var client = new Client;

  client.osName = osName || gazel.osName;
  if(osName) {
    client.needsOsVerification = true;
  }

  return client;
};

this.gazel = gazel;

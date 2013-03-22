gazel.dbName = "gazeldb";
gazel.osName = "gazelos";
gazel.setsOsName = "gazelos.sets";
gazel.version = 2;

var VERSION_KEY = "_gazel.version",
    version = localStorage[VERSION_KEY] && localStorage[VERSION_KEY] |0 || 1;
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

gazel.createClient = function() {
  return new Client;
};

this.gazel = gazel;

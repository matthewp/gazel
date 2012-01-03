var gazel = gazel || {};
gazel.version = "1.0";
gazel.dbName = "gazeldb";

gazel.compatible = exists(window.indexedDB) && exists(window.localStorage)
    && exists(window.IDBTransaction);

gazel.create = function () { return new Client; };

this.Gazel = gazel;


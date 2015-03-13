/*gazel@1.0.0#gazel*/
'use strict';
var _interopRequire = function (obj) {
    return obj && obj.__esModule ? obj['default'] : obj;
};
var print = require('./print.js').print;
var Client = _interopRequire(require('./client.js'));
var exists = _interopRequire(require('./exists.js'));
require('./polyfill.js');
var gazel = {};
gazel.dbName = 'gazeldb';
gazel.osName = 'gazelos';
var VERSION_KEY = '_gazel.version', version = localStorage[VERSION_KEY] && localStorage[VERSION_KEY] | 0 || 1;
Object.defineProperty(gazel, 'version', {
    get: function () {
        return version;
    },
    set: function (v) {
        version = v;
        localStorage[VERSION_KEY] = v;
    }
});
gazel.compatible = exists(window.indexedDB) && exists(window.IDBTransaction);
gazel.createClient = function (osName) {
    var client = new Client();
    client.osName = osName || gazel.osName;
    if (osName) {
        client.needsOsVerification = true;
    }
    return client;
};
window.gazel = gazel;
exports['default'] = gazel;
Object.defineProperty(exports, '__esModule', { value: true });

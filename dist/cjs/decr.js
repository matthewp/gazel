/*gazel@1.0.0#decr*/
'use strict';
exports.decrby = decrby;
exports.decr = decr;
function decrby(key, increment, callback) {
    return this.incrby(key, -increment, callback);
}
;
function decr(key, callback) {
    return this.incrby(key, -1, callback);
}
;
Object.defineProperty(exports, '__esModule', { value: true });

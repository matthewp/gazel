/*gazel@1.0.0#error*/
'use strict';
var _interopRequire = function (obj) {
    return obj && obj.__esModule ? obj['default'] : obj;
};
exports.handleError = handleError;
var slice = _interopRequire(require('./slice.js'));
function handleError() {
    var args = ['error'].concat(slice.call(arguments));
    this.emit.apply(this, args);
}
;
Object.defineProperty(exports, '__esModule', { value: true });

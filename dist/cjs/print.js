/*gazel@1.0.0#print*/
'use strict';
var _interopRequire = function (obj) {
    return obj && obj.__esModule ? obj['default'] : obj;
};
exports.print = print;
var slice = _interopRequire(require('./slice.js'));
function print() {
    var args = slice.call(arguments);
    if (args.length === 0) {
        return;
    }
    (Array.isArray(args[0]) ? args[0] : [args[0]]).forEach(function (item) {
        console.log(item);
    });
}
;
Object.defineProperty(exports, '__esModule', { value: true });

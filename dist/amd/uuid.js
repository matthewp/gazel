/*gazel@1.0.0#uuid*/
define(['exports'], function (exports) {
    'use strict';
    exports.createUuid = createUuid;
    function createUuid(a, b) {
        for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
        return b;
    }
    Object.defineProperty(exports, '__esModule', { value: true });
});

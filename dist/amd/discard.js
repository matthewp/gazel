/*gazel@1.0.0#discard*/
define(['exports'], function (exports) {
    'use strict';
    exports.discard = discard;
    function discard(callback) {
        try {
            this.trans.abortAll();
            (callback || function () {
            })('OK');
        } catch (err) {
            this.handleError(err);
        }
    }
    ;
    Object.defineProperty(exports, '__esModule', { value: true });
});

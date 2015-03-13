/*gazel@1.0.0#is_int*/
define([
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    module.exports = function (n) {
        return !isNaN(n) && n % 1 === 0;
    };
});

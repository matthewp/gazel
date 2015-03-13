/*gazel@1.0.0#exists*/
define([
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    module.exports = function (obj) {
        return typeof obj !== 'undefined' && obj != null;
    };
});

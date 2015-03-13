/*gazel@1.0.0#dict*/
define([
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    var _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps)
            Object.defineProperties(child, staticProps);
        if (instanceProps)
            Object.defineProperties(child.prototype, instanceProps);
    };
    var _classCallCheck = function (instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    };
    var Dict = function () {
            function Dict() {
                _classCallCheck(this, Dict);
                this.items = {};
            }
            _prototypeProperties(Dict, null, {
                prop: {
                    value: function prop(key) {
                        return ':' + key;
                    },
                    writable: true,
                    configurable: true
                },
                get: {
                    value: function get(key, def) {
                        var p = this.prop(key), k = this.items;
                        return k.hasOwnProperty(p) ? k[p] : def;
                    },
                    writable: true,
                    configurable: true
                },
                set: {
                    value: function set(key, value) {
                        var p = this.prop(key);
                        this.items[p] = value;
                        return value;
                    },
                    writable: true,
                    configurable: true
                },
                count: {
                    value: function count() {
                        return Object.keys(this.items).length;
                    },
                    writable: true,
                    configurable: true
                },
                has: {
                    value: function has(key) {
                        var p = this.prop(key);
                        return this.items.hasOwnProperty(p);
                    },
                    writable: true,
                    configurable: true
                },
                del: {
                    value: function del(key) {
                        var p = this.prop(key), k = this.items;
                        if (k.hasOwnProperty(p))
                            delete k[p];
                    },
                    writable: true,
                    configurable: true
                },
                keys: {
                    value: function keys() {
                        return Object.keys(this.items).map(function (key) {
                            return key.substring(1);
                        });
                    },
                    writable: true,
                    configurable: true
                }
            });
            return Dict;
        }();
    module.exports = Dict;
});

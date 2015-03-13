/*gazel@1.0.0#trans*/
'use strict';
var _interopRequire = function (obj) {
    return obj && obj.__esModule ? obj['default'] : obj;
};
var _prototypeProperties = function (child, staticProps, instanceProps) {
    if (staticProps)
        Object.defineProperties(child, staticProps);
    if (instanceProps)
        Object.defineProperties(child.prototype, instanceProps);
};
var _inherits = function (subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        subClass.__proto__ = superClass;
};
var _classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
};
var Dict = _interopRequire(require('./dict.js'));
var createUuid = require('./uuid.js').createUuid;
var Trans = function (Dict) {
        function Trans() {
            _classCallCheck(this, Trans);
            if (Dict != null) {
                Dict.apply(this, arguments);
            }
        }
        _inherits(Trans, Dict);
        _prototypeProperties(Trans, null, {
            add: {
                value: function add() {
                    var uuid = createUuid();
                    this.set(uuid, undefined);
                    return uuid;
                },
                writable: true,
                configurable: true
            },
            abortAll: {
                value: function abortAll() {
                    var self = this, keys = self.keys();
                    keys.forEach(function (key) {
                        var tx = self.get(key);
                        if (tx)
                            tx.abort();
                        self.del(key);
                    });
                },
                writable: true,
                configurable: true
            },
            pull: {
                value: function pull(db, os, uuid, perm) {
                    var tx = this.get(uuid);
                    if (!tx) {
                        tx = db.transaction([os], perm);
                        tx.onerror = onerror;
                        this.set(uuid, tx);
                    }
                    return tx;
                },
                writable: true,
                configurable: true
            }
        });
        return Trans;
    }(Dict);
module.exports = Trans;

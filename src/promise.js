var Promise = (function () {
    function Promise() {
        this.thens = [];
    };

    Promise.prototype._then = function (resolved, rejected) {
        // capture calls to callbacks
        this.thens.push([resolved, rejected]);
    };

    Promise.prototype._complete = function (success, arg) {
        // switch over to sync then()
        this._then = success ?
			function (resolve, reject) { resolve && resolve(arg); } :
			function (resolve, reject) { reject && reject(arg); };
        // disallow multiple calls to resolve or reject
        this._resolve = this._reject =
			function () { throw new Error('Promise already completed.'); };
        // complete all callbacks
        var aThen, cb, i = 0;
        while ((aThen = this.thens[i++])) {
            cb = aThen[success ? 0 : 1];
            if (cb) cb(arg);
        }
    };

    Promise.prototype._resolve = function (val) { this._complete(true, val); };

    Promise.prototype._reject = function (ex) { this._complete(false, ex); };


    Promise.prototype.then = function (resolved, rejected) {
        this._then(resolved, rejected);
        return this;
    };

    Promise.prototype.resolve = function (val) {
        this.resolved = val;
        this._resolve(val);
    };

    Promise.prototype.reject = function (ex) {
        this.rejected = ex;
        this._reject(ex);
    };

    return Promise;
})();

Promise.create = function() { return new Promise; };
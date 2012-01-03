var Client = (function () {
    function Client() {
        var self = this;
        this._events = {};
        this._onerror = function (e) {
            var action = self.events["error"];
            if (exists(action)) {
                action(e);
            }
        };

        this._ixdb = Ixdb.create();

        this._chaining = false;
        this._queue = Queue.create(this);
    };

    Client.prototype.on = function (event, action) {
        this._events[event] = action;
    };

    Client.prototype.get = function (key, onsuccess) {
        if (this._chaining) {
            this._queue.add(this._ixdb.get, [key, this._queue.flush, this._onerror]);
            return this;
        } else { this._ixdb.get(key, onsuccess, this._onerror); }
    },

        Client.prototype.set = function (key, value, onsuccess) {
            if (this._chaining) {
                this._queue.add(this._ixdb.set, [key, value, this._queue.flush, this._onerror]);
                return this;
            } else { this._ixdb.set(key, value, onsuccess, this._onerror); }
        };

    Client.prototype.incr = function (key, by, onsuccess) {
        var self = this;
        var got = function (val) {
            self._ixdb.set(key, val + by, onsuccess, self._onerror);
        };
        this._ixdb.get(key, got, this._onerror);
    };

    Client.prototype.multi = function () {
        this._chaining = true;
        return this;
    };

    Client.prototype.exec = function (onsuccess) {
        this._chaining = false;
        this._queue.add(onsuccess, null);
        this._queue.flush();
    };

    return Client;
})();


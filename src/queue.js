var Queue = (function () {
    function Queue() {
    };

    Queue.prototype.items = [];
    Queue.prototype.results = [];
    Queue.prototype.add = function (action) {
        this.items.push(action);
    };
    Queue.prototype.complete = function () { };
    Queue.prototype.flush = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 0) { this.results.push(args); }
        if (this.items.length > 0) {
            var action = this.items.shift();
            action();
        } else { // Complete, callback.
            var results = this.results;
            this.clear();
            this.complete(results);
        }
    };
    Queue.prototype.clear = function () {
        this.items = [];
        this.results = [];
    };

    Queue.create = function () {
        return new Queue;
    };

    return Queue;
})();

var Queue = (function () {
    function Queue(ctx) {
        this.ctx = ctx;
    };

    Queue.prototype.items = [];
    Queue.prototype.results = [];
    Queue.prototype.add = function (action, params) {
        this.items.push({ "action": action, "params": params });
    };
    Queue.prototype.flush = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length > 0) { this.results.push(args); }
        if (this.items.length > 0) {
            var item = this.items.shift();
            item.action.apply(this.ctx, item.params);
        }
    };
    Queue.prototype.clear = function () {
        this.items = [];
        this.results = [];
    };

    return Queue;
})();

Queue.create = function (ctx) { return new Queue(ctx); };


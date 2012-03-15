function Queue() {

}

Queue.prototype = {
  items: [],

  results: [],

  add: function (action) {
    this.items.push(action);
  },

  complete: function () { },

  flush: function () {
    var args = Array.prototype.slice.call(arguments);

    if (args.length > 0)
      this.results.push(args);
    
    if (this.items.length > 0) {
      var action = this.items.shift();
      action();
    } else { // Complete, callback.
      var results = this.results;
      this.clear();
      this.complete(results);
    }
  },

  clear: function () {
    this.items = [];
    this.results = [];
  }
};

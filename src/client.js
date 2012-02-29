function Client() {

}

Client.prototype = {
  chain: [],

  returned: [],

  events: { },

  register: function(action, callback) {
    if(this.chain.length > 0) {
      callback = this.exec;

      this.chain.push(action);

      return;
    }

    action(callback);
  },

  exec: function(callback) {
    var args = Array.prototype.slice.call(arguments) || [];

    if(args.length === 1 && typeof args[0] === 'function') {
      this.complete = callback;

      this.chain.forEach(function(action) {
        action();
      });

      return;
    }

    this.returned.push(args);

    if(this.returned.length === this.chain.length) {
      // We are complete, reset and return.
      this.complete(this.returned);

      this.complete = null;
      this.chain = [];
      this.returned = [];
    }
  },

  on: function(eventType, action) {
    var event = this.events[eventType] = this.events[eventType] || [];
    event.push(action);
  },

  get: function(key, callback) {

  },

  set: function(key, value, callback) {
    this.register(function() {
      openWritable(function(os) {
        // TODO do stuff with objectStore
        callback();
      });
    });

    return this;
  }
};

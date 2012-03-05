function Client() {

}

Client.prototype = {
  chain: null,

  returned: [],

  events: { },

  register: function(action, callback) {
    if(this.chain !== null) {
      callback = this.flush;

      this.chain.push(action);

      return;
    }

    action(callback);
  },

  flush: function() {
    var args = Array.prototype.slice.call(arguments) || [];

    if(args.length > 0) {
      this.returned.push(args);
    }

    if(this.chain.length === 0) {
      this.complete();
    }

    this.chain.shift().call(this);
  },

  multi: function() {
    this.chain = [];

    return this;
  },

  exec: function(callback) {
    this.complete = function() {
      var returned = this.returned;

      this.complete = null;
      this.chain = null;
      this.returned = [];

      callback(returned);
    }

    this.flush();
  },

  on: function(eventType, action) {
    var event = this.events[eventType] = this.events[eventType] || [];
    event.push(action);
  },

  get: function(key, callback) {
    // TODO write function to get contents.

    return this;
  },

  set: function(key, value, callback) {
    this.register(function() {
      openWritable(function(os) {
        // TODO do stuff with objectStore
        callback();
      }, callback);
    });

    return this;
  }
};

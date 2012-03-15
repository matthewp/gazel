function Client() {

}

Client.prototype = {
  chain: null,

  inMulti: function() {
    return this.chain !== null;
  },

  returned: [],

  events: { },

  register: function(action, callback) {
    if(this.inMulti()) {
      this.chain.push(action);

      return;
    }

    action(callback || function(){});
  },

  flush: function() {
    var args = Array.prototype.slice.call(arguments) || [];

    this.returned.push(args);

    if(this.chain.length === 0) {
      this.complete();

      return;
    }

    this.chain.shift().call(this, this.flush);
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
    };

    var action = this.chain.shift();
    action.call(this, this.flush);
  },

  on: function(eventType, action) {
    var event = this.events[eventType] = this.events[eventType] || [];
    event.push(action);
  }
};

function Client() {

}

Client.prototype = {
  chain: null,

  inMulti: false,

  returned: [],

  events: { },

  trans: new Trans(),

  register: function(action, callback) {
    if(this.inMulti) {
      this.chain.push(action);

      return;
    }

    var self = this;
    action(function() {
      var args = slice.call(arguments);

      if(self.trans.count() > 0) {
        self.trans.keys.forEach(function(key) {
          self.trans.del(key);
        });
      }

      (callback || function(){}).apply(null, args);
    });
  },

  flush: function() {
    var args = slice.call(arguments) || [];

    this.returned.push(args);

    if(this.chain.length === 0) {
      this.complete();

      return;
    }

    this.chain.shift().call(this, this.flush);
  },

  multi: function() {
    this.chain = [];
    this.inMulti = true;

    return this;
  },

  exec: function(callback) {
    this.inMulti = false;

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

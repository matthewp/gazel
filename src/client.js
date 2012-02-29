function Client() {

}

Client.prototype = {
  chain: [],

  events: { },

  register: function(action) {
    if(this.chain.length > 0) {
      this.chain.push(action);

      return;
    }

    action(callback);
  },

  on: function(eventType, action) {
    var event = this.events[eventType] = this.events[eventType] || [];
    event.push(action);
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

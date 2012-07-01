function Client() {
  this.chain = [];
  this.inMulti = false;
  this.returned = [];

  this.trans = new Trans();
  this.transMap = new Dict();

  this.events = new Dict();
}

Client.prototype = {
  register: function(type, action, callback) {
    var uuid, self = this;

    if(this.needsOsVerification) {
      ensureObjectStore(this.osName, function() {
        self.needsOsVerification = false;

        self.register(type, action, callback);
      }, this.handleError.bind(this));

      return;
    }

    if(this.inMulti) {
      uuid = this.transMap.get(type);
      if(!uuid) {
        uuid = this.trans.add();
        this.transMap.set(type, uuid);
      }

      this.chain.push({
        uuid: uuid,
        action: action
      });

      return;
    }

    uuid = self.trans.add();

    action(uuid, function() {
      var args = slice.call(arguments);

      self.trans.del(uuid);

      (callback || function() { }).apply(null, args);
    });
  },

  flush: function() {
    var args = slice.call(arguments) || [];

    this.returned.push(args);

    if(this.chain.length === 0) {
      this.complete();

      return;
    }

    var item = this.chain.shift();
    item.action.call(this, item.uuid, this.flush);
  },

  multi: function() {
    this.chain = [];
    this.inMulti = true;

    return this;
  },

  exec: function(callback) {
    this.inMulti = false;

    this.complete = function() {
      var self = this,
          returned = this.returned;

      this.complete = null;
      this.chain = null;
      this.returned = [];

      this.transMap.keys().forEach(function(key) {
        var uuid = self.transMap.get(key);

        self.trans.del(uuid);
      });

      this.transMap = new Dict();

      callback(returned);
    };

    var item = this.chain.shift();
    item.action.call(this, item.uuid, this.flush);
  },

  on: function(eventType, action) {
    var event = this.events.get(eventType);
    if(!event) {
      event = [];
      this.events.set(eventType, event);
    }

    event.push(action);
  }
};

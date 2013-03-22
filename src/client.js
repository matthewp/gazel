function Client() {
  this.chain = [];
  this.inMulti = false;
  this.returned = [];

  this.trans = new Trans();
  this.transMap = new Dict();

  this.events = new Dict();
}

Client.prototype = {
  register: function(type, action, callback, lock) {
    var uuid, self = this, inMulti = this.inMulti;

    if(lock && !this.inMulti) {
      this.multi();
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

      if(inMulti) {
        return;
      }
    }

    if(!uuid) {
      uuid = self.trans.add();
    }

    if(lock) {
      this.exec(function(results) {
        (callback || function() { }).apply(null, results[0]);
      });

      return;
    }

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
  },
  
  off: function(eventType, action) {
    if(!action) {
      this.events.del(eventType); return;
    }
    var event = this.events.get(eventType);
    event.splice(event.indexOf(action), 1);
  }
};

import { decr, decrby } from './decr';
import { del, _del } from './del';
import { discard } from './discard';
import { handleError } from './error';
import { get } from './get';
import { incr, incrby } from './incr';
import { set, _set } from './set';
import Dict from './dict';
import Trans from './trans';
import { ensureObjectStore } from './dbfunctions';
import slice from './slice';

export default Client;

function Client() {
  this.chain = [];
  this.inMulti = false;
  this.returned = [];

  this.trans = new Trans();
  this.transMap = new Dict();
  this.events = new Dict();
}

var p = Client.prototype = {
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
  },
  
  off: function(eventType, action) {
    if(!action) {
      this.events.del(eventType); return;
    }
    var event = this.events.get(eventType);
    event.splice(event.indexOf(action), 1);
  },

	emit: function(eventType) {
		var args = slice.call(arguments, 1),
        self = this;

    setTimeout(function(){
      (self.events.get(eventType) || [])
        .forEach(function(action) {
          action.apply(null, args);
        });
    });
	}
};

p.decr = decr;
p.decrby = decrby;
p.del = del;
p._del = _del;
p.discard = discard;
p.handleError = handleError;
p.get = get;
p.incr = incr;
p.incrby = incrby;
p.set = set;
p._set = _set;

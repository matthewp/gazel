Client.prototype._sGetMemberKey = function(key, value) {
  return key + ':' + JSON.stringify(value);
};

Client.prototype.sadd = function(key, value, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    var osKey = self._sGetMemberKey(key, value);
    var obj = {
      key: key,
      value: value
    };

    setValue(gazel.setsOsName, self.trans, uuid,
      osKey, obj, cb, self.handleError.bind(self), self);

  }, callback);
  return this;
};

Client.prototype.smembers = function(key, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    
    var members = [];
    transverseKeys(gazel.setsOsName, self.trans, uuid, 'key', key, function(res) {
      if(res) {
        members.push(res.value);
        return true;
      } else {
        cb.call(self, members);
        return false;
      }
    }, self.handleError.bind(self), self);

  }, callback);

  return this;
};

Client.prototype.scard = function(key, callback) {
  this.smembers(key, function(members) {
    callback(members.length || 0);
  });

  return this;
};

Client.prototype.sismember = function(key, value, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    var osKey = self._sGetMemberKey(key, value);

    getKey(gazel.setsOsName, self.trans, uuid, osKey, function(res) {
      cb(res !== undefined);
    }, self.handleError.bind(self), self);
  }, callback);

  return this;
};

Client.prototype.sdel = function(key, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    self.smembers(key, function(members) {
      var deleted = members.length;
      if(!deleted) {
        cb.call(self, deleted); return;
      }

      var membersKeys = members.map(function(member) {
        return self._sGetMemberKey(key, member);
      });

      deleteKey(gazel.setsOsName, self.trans, uuid, membersKeys, function() {
        cb.call(self, deleted);
      }, self.handleError.bind(self), self);
    });
  }, callback);


  return this;
};

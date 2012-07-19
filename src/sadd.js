Client.prototype.sadd = function(key, member, callback) {
  var self = this;

  this.register('write', function(uuid, cb) {
    var errback = self.handleError.bind(self);

    getKey(gazel.osName, self.trans, uuid, key,
      function(members) {
        if(members && (member in members)) { // member already in set.
          cb.call(self, 'OK');

          return;
        } else if(!members) {
          members = [];
        }

        members.push(':' + member.toString());
        setValue(gazel.osName, self.trans, uuid,
          key, members, cb, errback, self);
      }, errback, self, IDBTransaction.READ_WRITE);

  }, callback);

  return this;
};

Client.prototype.smembers = function(key, callback) {
  var self = this;

  this.register('read', function(uuid, cb) {
    getKey(gazel.osName, self.trans, uuid, key, function(values) {
      var members = values.map(function(value) {
        return value.split(':').splice(1).toString();
      });

      cb.call(self, members);
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

Client.prototype.sismember = function(key, member, callback) {
  var self = this;

  if(typeof member !== 'string') {
    member = member.toString();
  }

  this.register('read', function(uuid, cb) {
    self.smembers(key, function(members) {
      var isMember = members.some(function(value) {
        return member === value;
      });

      cb.call(self, isMember);
    });


    var osKey = self._sGetMemberKey(key, value);

    getKey(gazel.setsOsName, self.trans, uuid, osKey, function(res) {
      cb(res !== undefined);
    }, self.handleError.bind(self), self);
  }, callback);

  return this;
};
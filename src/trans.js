var Trans = Thing.create(Dict, {

  add: function() {
    var uuid = createUuid();
    this.set(uuid, undefined);

    return uuid;
  },

  abortAll: function() {
    var self = this,
        keys = self.keys();

    keys.forEach(function(key) {
      var tx = self.get(key);
      tx.abort();

      self.del(key);
    });
  }
 
});

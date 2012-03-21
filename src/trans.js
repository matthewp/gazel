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
      if(tx)
        tx.abort();

      self.del(key);
    });
  },

  pull: function(db, uuid, perm) {
    var tx = this.get(uuid);
    if(!tx) {
      tx = db.transaction([gazel.osName], perm);
      tx.onerror = onerror;

      this.set(uuid, tx);
    }

    return tx;
  }
 
});

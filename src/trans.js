function Trans() {
  Dict.call(this);
}

Trans.prototype = Object.create(Dict.prototype);
Trans.prototype.constructor = Trans;

Trans.prototype.add = function() {
  var uuid = createUuid();
  this.set(uuid, undefined);

  return uuid;
};

Trans.prototype.abortAll = function() {
  var self = this,
      keys = self.keys();

  keys.forEach(function(key) {
    var tx = self.get(key);
    if(tx)
      tx.abort();

    self.del(key);
  });
};

Trans.prototype.pull = function(db, os, uuid, perm) {
  var tx = this.get(uuid);
  if(!tx) {
    tx = db.transaction([os], perm);
    tx.onerror = onerror;

    this.set(uuid, tx);
  }

  return tx;
};

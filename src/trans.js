function Trans() { }

Trans.prototype = new Dict;
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
    tx.abort();

    self.del(key);
  });
};

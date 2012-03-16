var Trans = Object.create(Dict, {

  abortAll: function() {
    var self = this,
        keys = self.keys();

    keys.forEach(function(key) {
      var tx = self.get(key);

      tx.abort();
    });
  }

});

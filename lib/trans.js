import Dict from './dict';
import { createUuid } from './uuid';

export default class Trans extends Dict {
  add() {
    var uuid = createUuid();
    this.set(uuid, undefined);

    return uuid;
  }

  abortAll() {
    var self = this,
        keys = self.keys();

    keys.forEach(function(key) {
      var tx = self.get(key);
      if(tx)
        tx.abort();

      self.del(key);
    });
  }

  pull(db, os, uuid, perm) {
    var tx = this.get(uuid);
    if(!tx) {
      tx = db.transaction([os], perm);
      tx.onerror = onerror;

      this.set(uuid, tx);
    }

    return tx;
  }
}

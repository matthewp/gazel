Client.prototype.discard = function() {
  this.trans.abortAll();
};

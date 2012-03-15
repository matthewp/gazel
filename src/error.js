Client.prototype.handleError = function() {
  var args = Array.prototype.slice.call(arguments);

  var actions = this.events['error'] || [];
  actions.forEach(function(action) {
    action.apply(null, args);
  });
};

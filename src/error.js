Client.prototype.handleError = function() {
  var args = slice.call(arguments);

  (this.events.get('error') || [])
    .forEach(function(action) {
      action.apply(null, args);
    });
};

Object.defineProperty(Client.prototype, 'handleError', {

  value: function() {
    var args = Array.prototype.slice.call(arguments);

    var actions = this.events['error'] || [];
    actions.forEach(function(action) {
      action.apply(null, args);
    });
  },

  writable: true,

  enumerable: true,

  configurable: true
});

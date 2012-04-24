function Dict() {
    this.items = {};
}

Dict.prototype = {

  prop: function(key) {
    return ':' + key;
  },

  get: function(key, def) {
    var p = this.prop(key),
        k = this.items;

    return k.hasOwnProperty(p) ? k[p] : def;
  },

  set: function(key, value) {
    var p = this.prop(key);

    this.items[p] = value;

    return value;
  },

  count: function() {
    return Object.keys(this.items).length;
  },

  has: function(key) {
    var p = this.prop(key);

    return this.items.hasOwnProperty(p);
  },

  del: function(key) {
    var p = this.prop(key),
        k = this.items;

    if(k.hasOwnProperty(p))
      delete k[p];
  },

  keys: function() {
    return Object.keys(this.items).map(function(key) {
      return key.substring(1);
    });
  }

};

export default class Dict {
  constructor() {
    this.items = {};
  }

  prop(key) {
    return ':' + key;
  }

  get(key, def) {
    var p = this.prop(key),
        k = this.items;

    return k.hasOwnProperty(p) ? k[p] : def;
  }

  set(key, value) {
    var p = this.prop(key);

    this.items[p] = value;

    return value;
  }

  count() {
    return Object.keys(this.items).length;
  }

  has(key) {
    var p = this.prop(key);

    return this.items.hasOwnProperty(p);
  }

  del(key) {
    var p = this.prop(key),
        k = this.items;

    if(k.hasOwnProperty(p))
      delete k[p];
  }

  keys() {
    return Object.keys(this.items).map(function(key) {
      return key.substring(1);
    });
  }

}

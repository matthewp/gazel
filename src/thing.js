var Thing = Object.create(null);
Thing.create = function(proto, props, init) {
  if(typeof props === 'undefined' && typeof init === 'undefined')
    return Object.create(proto);
  else if(typeof props === 'boolean') {
    init = props;
    props = undefined;
  }

  var desc = {};
  for(var p in props) {
    desc[p] = {
      value: props[p],
      writeable: true,
      enumerable: true,
      configurable: true
    };
  }

  var o = Object.create(proto, desc);

  if(init)
    o = o.init();

  return o;
};

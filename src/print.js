gazel.print = function() {
  var args = slice.call(arguments);
  if(args.length === 0)
    return;

  (Array.isArray(args[0]) ? args[0] : [args[0]])
    .forEach(function(item) {
      console.log(item);
    });
};

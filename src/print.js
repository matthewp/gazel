gazel.print = function() {
  var args = slice.call(arguments);
  if(args.length === 0)
    return;

  (args[0] instanceof Array ? args[0] : [args[0]])
    .forEach(function(item) {
      console.log(item);
    });
};

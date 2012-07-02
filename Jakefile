var fs = require('fs');

var outFile = 'gazel.js',
    minFile = 'gazel.min.js';

var files = [
  "src/setup.js",
  "src/uuid.js",
  "src/dict.js",
  "src/trans.js",
  "src/client.js",
  "src/discard.js",
  "src/error.js",
  "src/get.js",
  "src/set.js",
  "src/incr.js",
  "src/decr.js",
  "src/del.js",
  "src/print.js",
  "src/gazel.js",
  "src/dbfunctions.js"
];

desc('Default, combine all files')
file({'gazel.js': files}, function() {

  var data = "/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */\n\n";
  data += "(function() {\n"
  files.forEach(function(file) {
    data += fs.readFileSync(file);
  });
  data += "\n}).call(this);";

  fs.writeFileSync(outFile, data);
});

var fs = require('fs'),
    spawn = require('child_process').spawn;

var outFile = 'build/gazel.js',
    minFile = 'build/gazel.min.js';

var UGLIFYJS = require('os').platform().indexOf('win') !== -1
  ? 'uglifyjs.cmd'
  : 'uglifyjs';

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
task('gazel', [], function() {

  var data = "/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */\n\n";
  data += "(function(undefined) {\n"
  files.forEach(function(file) {
    data += fs.readFileSync(file);
  });
  data += "\n}).call(this);";

  fs.writeFileSync(outFile, data);
});

task('min', [], function() {

  var ugjs = spawn(UGLIFYJS, [ '-nc', '-o',
    minFile, outFile]);

  var log = function(d) {
    console.log('' + d);
  };

  ugjs.stdout.on('data', log);
  ugjs.stderr.on('data', log);
  ugjs.on('exit', complete);

}, { async: true });

desc('Default task');
task('default', function() {
  jake.Task['gazel'].invoke();
  jake.Task['min'].invoke();
});

var stealTools = require('steal-tools');
var gulp = require('gulp');

gulp.task('build', function() {
  stealTools.export({
    system: {
      config: "package.json!npm"
    },
    outputs: {
      "+global-js": {
        dest: __dirname + "/dist/gazel.js"
      },
      "+global-js minified": {
        dest: __dirname + "/dist/gazel.min.js",
        minify: true
      },
      "+cjs": {},
      "+amd": {}
    }
  });
});

gulp.task('default', ['build']);


module.exports = function(grunt) {
  var outFile = 'build/gazel.js',
      minFile = 'build/gazel.min.js';

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

  grunt.initConfig({
    concat: {
      dist: {
        src: files,
        dest: outFile
      }
    },
    uglify: {
      dist: {
        files: {
          'build/gazel.min.js': outFile
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
        options: {
          es5: true,
          eqnull: true,
          laxbreak: true,
          globals: {
          }
        }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};

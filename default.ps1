properties {
  $nl = [Environment]::NewLine
  $out_file = "gazel.js"
  $min_file = "gazel.min.js"

  $files = @(
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
  )
}

task default -depends Compile

task Compile -depends Concat, Minify {

}

task Concat {
  echo "/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */" > $out_file
  echo $nl >> $out_file
  echo "(function() {" >> $out_file
  foreach($file in $files) {
    cat $file >> gazel.js
  }
  echo "}).call(this);" >> $out_file
}

task Minify {
  uglifyjs -nc -o $min_file $out_file
}

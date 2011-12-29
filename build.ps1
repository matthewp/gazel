$outfile = "build\gazel.js"
$minfile = "build\gazel.min.js"

$files = @(
	'src\gazel.js',
	'src\ixdb.js'
)

"(function () {" > $outfile

foreach ($file in $files) {
	Get-Content $file >> $outfile
}

"}).call(this);" >> $outfile

$outfile = "build\gazel.js"
$minfile = "build\gazel.min.js"

$files = @(
	'src\setup.js',
	'src\ixdb.js',
	'src\queue.js',
	'src\client.js',
	'src\gazel.js'
)

"(function () {" > $outfile

foreach ($file in $files) {
	Get-Content $file >> $outfile
}

"}).call(this);" >> $outfile

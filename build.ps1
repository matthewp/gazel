$outfile = "build\gazel.js"
$minfile = "build\gazel.min.js"

$files = @(
	'src\setup.js',
	'src\handlers.js',
	'src\dbfunctions.js',
	'src\queue.js',
	'src\gazel.js',
	'src\transactions.js'
)

"(function () {" > $outfile

foreach ($file in $files) {
	Get-Content $file >> $outfile
}

"}).call(this);" >> $outfile

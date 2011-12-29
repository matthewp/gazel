# Set the source directory
srcdir = src/

builddir = build/

# Create the list of modules
modules =   ${srcdir}gazel.js\
            ${srcdir}ixdb.js       

# Compress all of the modules into gazel.js
gazel.js: ${modules}
	cat > ${builddir}$@ $^

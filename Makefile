# Set the source directory
srcdir = src/

builddir = build/

# Create the list of modules
modules =   ${srcdir}setup.js\
        ${srcdir}handlers.js\
	    ${srcdir}queue.js\
		${srcdir}dbfunctions.js\
        ${srcdir}gazel.js\
		${srcdir}transactions.js

# Compress all of the modules into gazel.js
gazel.js: ${modules}
	cat > ${builddir}$@ $^

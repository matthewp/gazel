# Set the source directory
BUILD_DIR = build/

# Create the list of modules
MODULES = src/setup.js\
          src/uuid.js\
          src/dict.js\
          src/trans.js\
          src/client.js\
          src/discard.js\
          src/error.js\
          src/get.js\
          src/set.js\
          src/incr.js\
          src/decr.js\
          src/del.js\
          src/print.js\
          src/gazel.js\
		      src/dbfunctions.js\

all: gazel.js gazel.min.js

# Compress all of the modules into gazel.js
gazel.js: $(MODULES)
	echo "/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */" > $(BUILD_DIR)$@
	echo ${\n} >> $(BUILD_DIR)$@
	echo "(function() {" >> $(BUILD_DIR)$@
	cat >> $(BUILD_DIR)$@ $^
	echo "}).call(this);" >> $(BUILD_DIR)$@

gazel.min.js:
	uglifyjs -nc -o $(BUILD_DIR)$@ $(BUILD_DIR)gazel.js


all : build

build:
	tsc --declaration

release: build
	mkdir -p build
	browserify src/compile.js -o build/linear.js -s linear

test: build
	node src/test.js

clean:
	rm -rf build
	rm src/linear.js src/test.js

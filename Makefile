all : build

build:
	tsc 

release: build
	mkdir -p build
	browserify src/compile.js -o build/linearsearch.js -s linear

test: build
	node src/test.js

clean:
	rm -rf build
	rm src/linear.js

## What is it?

LinearSearch incorporates a linear combination of previous search picks to help sort search results.

``` 
searchScore = textualCloseness * weight + numberOfPicksInLastN * weightN + ...
```

By default, LinearSearch uses an algorithm similar to the one found in Sublime Text for filtering before sorting.

## Usage
```js
	
// override the default options for Search
var options = new linear.SearchOptions();
// the algorithm used to filter results before sorting
options.filter = new linear.SublimeFilter();
// the weight for the closeness metric
options.filterValueWeight = 0.5; 
// the weight for picks in this session
options.sessionWeight = 0.1; 
// a dictionary mapping number of past search queries to weights
options.weights = {
	2 : 1 / 2,
	10 : 1/10 * 1,
	20 : 1/20 * 5	
}

// linear.Search uses the defaults if this is not provided
var ls = new linear.Search(options);

// add SearchItems
ls.add(new linear.SearchItem(["app"])); 
ls.add(new linear.SearchItem(["apple"]));

// do a search
var res = ls.search("app");
```

## Install via npm

```
npm install linearsearch
```

## Build

### Install prereqs

Install [node.js](http://www.nodejs.org)

```
npm install -g browserify
npm install -g typescript
```

### make

```
make build
```

## Build for the web

```
make release
```
Produces linear.js in the build directory

## Test

```
make test
```

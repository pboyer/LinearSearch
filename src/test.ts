/// <reference path="../typings/node.d.ts" />
import * as assert from "assert";

import linear = require('./linear');

(function(){
	var ls = new linear.SublimeFilter();
	
	ls.onBeginSearch("k");
	
	var e = new linear.SearchElement(["app"]);
	
	assert.equal(0.0, ls.filter("k", e));
})();


(function(){
	var ls = new linear.Search();
	
	ls.add( new linear.SearchElement(["app"]) ); 
	ls.add( new linear.SearchElement(["apple"]) ); 

	var res = ls.search("k");
	assert.equal(0, res.length);
	
})();

(function(){
	var ls = new linear.Search();
	
	ls.add( new linear.SearchElement(["app"]) ); 
	ls.add( new linear.SearchElement(["apple"]) ); 
	
	// search one time
	var res1 = ls.search("app");

	// pick "apple"
	res1[1].pick();
	
	// search again
	var res2 = ls.search("app");
	
	// now apple is the first result
	assert.equal( res2[0], res1[1] );
})();

(function(){
	var ls = new linear.Search();
	 
	ls.add( new linear.SearchElement(["1app"]) ); 
	ls.add( new linear.SearchElement(["a1pp"]) ); 
	ls.add( new linear.SearchElement(["ap1p"]) ); 
	ls.add( new linear.SearchElement(["app1"]) ); 
	
	// search one time
	var res1 = ls.search("app");

	// pick "ap1p" and remember
	res1[2].pick();
	var picked = res1[2];
	
	// search again
	var res2 = ls.search("app");
	
	// now the last picked result is the first result
	assert.equal( res2[0], res1[2] );
})();



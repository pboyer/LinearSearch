(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.linear = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var linear = require('./linear');

module.exports = {
	Search : linear.Search,
	Filter : linear.SublimeFilter,
	SearchItem : linear.SearchItem,
	SearchOptions : linear.SearchOptions,
	SearchWeights : linear.SearchWeight
};

},{"./linear":2}],2:[function(require,module,exports){
var SearchOptions = (function () {
    function SearchOptions() {
        this.filter = new SublimeFilter();
        this.items = [];
        this.filterThreshold = 0.1;
        this.weights = new SearchWeights();
    }
    return SearchOptions;
})();
exports.SearchOptions = SearchOptions;
var SearchWeights = (function () {
    function SearchWeights() {
        this.baseValueWeight = 0;
        this.sessionCountWeight = 1 / 50;
        this.filterValueWeight = 20;
        this.localWeights = {
            2: 2 / 5,
            5: 2 / 5,
            20: 1 / 20
        };
    }
    return SearchWeights;
})();
exports.SearchWeights = SearchWeights;
var Search = (function () {
    function Search(options) {
        options = options || new SearchOptions();
        this._filter = options.filter;
        this._items = options.items;
        this._weights = options.weights;
        this._filterThreshold = options.filterThreshold;
    }
    Search.prototype.search = function (query) {
        var _this = this;
        this._filter.onBeginSearch(query);
        this._items.forEach(function (e) { return e.onBeginSearch(query); });
        return this._items
            .filter(function (e) { return _this._filterThreshold < (e.lastFilterValue = _this._filter.filter(query, e)); })
            .sort(function (a, b) { return b.score(_this._weights) - a.score(_this._weights); });
    };
    Search.prototype.add = function (item) {
        this._items.push(item);
    };
    Search.prototype.remove = function (item) {
        var i = this._items.indexOf(item);
        if (i > -1)
            this._items.splice(i, 1);
    };
    return Search;
})();
exports.Search = Search;
var SearchItem = (function () {
    function SearchItem(tags) {
        this._count = 0 >>> 0; // 32bit mask
        this.baseValue = 0;
        this.sessionCount = 0;
        this.lastFilterValue = 0;
        this._tags = tags;
    }
    SearchItem.prototype.onBeginSearch = function (_) {
        this._count = this._count << 1;
    };
    SearchItem.prototype.tags = function () {
        return this._tags;
    };
    SearchItem.prototype.pick = function () {
        this._count = this._count | 1;
        this.sessionCount++;
    };
    SearchItem.prototype.score = function (weights) {
        var score = this.baseValue * weights.baseValueWeight
            + this.sessionCount * weights.sessionCountWeight
            + this.lastFilterValue + weights.filterValueWeight;
        for (var n in weights.localWeights) {
            score += this.count(n) * weights.localWeights[n];
        }
        return score;
    };
    SearchItem.prototype.count = function (num) {
        var c = this._count;
        var t = 0;
        for (var i = 0; i < num; i++) {
            t += c & 1;
            c = c >> 1;
        }
        return t;
    };
    return SearchItem;
})();
exports.SearchItem = SearchItem;
var SublimeFilter = (function () {
    function SublimeFilter() {
    }
    SublimeFilter.prototype.onBeginSearch = function (query) {
        var r = query.replace(' ', '').split('').join('.*?');
        this.regex = new RegExp(r);
    };
    SublimeFilter.prototype.filter = function (query, item) {
        var _this = this;
        return Math.max.apply(null, item.tags().map(function (n) {
            return _this.regex.test(n) ? query.length / n.length : 0.0;
        }));
    };
    return SublimeFilter;
})();
exports.SublimeFilter = SublimeFilter;

},{}]},{},[1])(1)
});
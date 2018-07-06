define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SearchOptions = /** @class */ (function () {
        function SearchOptions() {
            this.filter = new SublimeFilter();
            this.items = [];
            this.filterThreshold = 0.1;
            this.weights = new SearchWeights();
        }
        return SearchOptions;
    }());
    exports.SearchOptions = SearchOptions;
    var SearchWeights = /** @class */ (function () {
        function SearchWeights() {
            this.baseValueWeight = 0;
            this.sessionCountWeight = 1 / 50;
            this.filterValueWeight = 20;
            this.localWeights = [
                { n: 2, weight: 2 / 5 },
                { n: 5, weight: 2 / 5 },
                { n: 20, weight: 1 / 20 }
            ];
        }
        return SearchWeights;
    }());
    exports.SearchWeights = SearchWeights;
    var Search = /** @class */ (function () {
        function Search(options) {
            var defaultOpts = new SearchOptions();
            options = options || defaultOpts;
            this._filter = options.filter || defaultOpts.filter;
            this._items = options.items || defaultOpts.items;
            this._weights = options.weights || defaultOpts.weights;
            this._filterThreshold = options.filterThreshold || defaultOpts.filterThreshold;
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
    }());
    exports.Search = Search;
    var SearchItem = /** @class */ (function () {
        function SearchItem(tags) {
            this._count = 0 >>> 0; // 32bit mask
            this.baseValue = 0;
            this.sessionCount = 0;
            this.lastFilterValue = 0;
            this.tags = tags;
        }
        SearchItem.prototype.onBeginSearch = function (_) {
            this._count = this._count << 1;
        };
        SearchItem.prototype.pick = function () {
            this._count = this._count | 1;
            this.sessionCount++;
        };
        SearchItem.prototype.score = function (weights) {
            var _this = this;
            var score = this.baseValue * weights.baseValueWeight
                + this.sessionCount * weights.sessionCountWeight
                + this.lastFilterValue + weights.filterValueWeight;
            weights.localWeights.forEach(function (x) { return score += _this.count(x.n) * x.weight; });
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
    }());
    exports.SearchItem = SearchItem;
    var SublimeFilter = /** @class */ (function () {
        function SublimeFilter() {
        }
        SublimeFilter.prototype.onBeginSearch = function (query) {
            var r = query.replace(' ', '').split('').join('.*?');
            this.regex = new RegExp(r);
        };
        SublimeFilter.prototype.filter = function (query, item) {
            var _this = this;
            return Math.max.apply(null, item.tags.map(function (n) {
                return _this.regex.test(n) ? query.length / n.length : 0.0;
            }));
        };
        return SublimeFilter;
    }());
    exports.SublimeFilter = SublimeFilter;
});

export class SearchOptions {
	filter: IFilter = new SublimeFilter()
	items: ISearchItem[] = [];
	filterThreshold: number = 0.1;
	weights : SearchWeights = new SearchWeights();
}

export class SearchWeights {
	baseValueWeight: number = 0;
	sessionCountWeight: number = 1/50;
	filterValueWeight: number = 20;
	localWeights: { [id: number]: number } = {
		2 : 2/5,
		5 : 2/5,
		20 : 1/20	
	};
}

export class Search {
	private _filter: IFilter;
	private _items: ISearchItem[];
	private _weights : SearchWeights;
	private _filterThreshold: number;

	constructor(options?: SearchOptions) {
		options = options || new SearchOptions();
		
		this._filter = options.filter;
		this._items = options.items;
		this._weights = options.weights;
		this._filterThreshold = options.filterThreshold;
	}

	search(query: string): ISearchItem[] {
		this._filter.onBeginSearch(query);
		this._items.forEach((e) => e.onBeginSearch(query));
		
		return this._items
				.filter((e) => this._filterThreshold < (e.lastFilterValue = this._filter.filter(query, e)))
				.sort((a, b) => b.score(this._weights) - a.score(this._weights));
	}

	add(item: ISearchItem) {
		this._items.push(item);
	}
	
	remove(item: ISearchItem) {
		var i = this._items.indexOf(item);
		if (i > -1) this._items.splice(i,1);
	}
}

export interface ISearchItem {
	lastFilterValue : number;
	onBeginSearch(query : string);
	tags() : string[];
	pick();
	score( weights : SearchWeights ) : number;
	count( num : number ) : number;
}

export class SearchItem implements ISearchItem {
	private _count : number = 0 >>> 0; // 32bit mask
	private _tags: string[];
	
	baseValue : number = 0;
	sessionCount : number = 0;
	lastFilterValue : number = 0;
	
	constructor(tags: string[]) {
		this._tags = tags;
	}

	onBeginSearch( _ : string ) {
		this._count = this._count << 1;
	}
	
	tags() : string[] {
		return this._tags;
	}

	pick(){
		this._count = this._count | 1;
		this.sessionCount++;
	}
	
	score( weights : SearchWeights ) : number {
		var score = this.baseValue * weights.baseValueWeight 
			+ this.sessionCount * weights.sessionCountWeight 
			+ this.lastFilterValue + weights.filterValueWeight;
			
		for (var n in weights.localWeights){
			score += this.count(n) * weights.localWeights[n];
		}

		return score;
	}
	
	count(num : number) : number {
		var c = this._count;
		var t = 0;
		for (var i = 0; i < num; i++){
			t += c & 1;
			c = c >> 1;
		}
		return t;
	}
}

export interface IFilter {
	onBeginSearch(query: string);
	filter(query: string, element: ISearchItem): number;
}

export class SublimeFilter implements IFilter {
	private regex: RegExp;

	onBeginSearch(query: string) {
		var r = query.replace(' ', '').split('').join('.*?');
		this.regex = new RegExp(r);
	}

	filter(query: string, item: ISearchItem): number {
		return Math.max.apply(null, item.tags().map((n) => {
			return this.regex.test(n) ? query.length / n.length : 0.0
		}));
	}
}
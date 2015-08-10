export class SearchOptions {
	filter: IFilter = new SublimeFilter()
	elements: ISearchElement[] = [];
	filterThreshold: number = 0.1;
	weights : SearchWeights = new SearchWeights();
}

export class SearchWeights {
	baseValueWeight: number = 0;
	sessionCountWeight: number = 1/50;
	filterValueWeight: number = 20;
	localWeights: { [id: number]: number } = {
		2 : 1/4,
		5 : 1/20,
		20 : 1/40	
	};
}

export class Search {
	private _filter: IFilter;
	private _elements: ISearchElement[];
	private _weights : SearchWeights;
	private _filterThreshold: number;

	constructor(options?: SearchOptions) {
		options = options || new SearchOptions();
		
		this._filter = options.filter;
		this._elements = options.elements;
		this._weights = options.weights;
		this._filterThreshold = options.filterThreshold;
	}

	search(query: string): ISearchElement[] {
		this._filter.onBeginSearch(query);
		this._elements.forEach((e) => e.onBeginSearch(query));
		
		return this._elements
				.filter((e) => this._filterThreshold < (e.lastFilterValue = this._filter.filter(query, e)))
				.sort((a, b) => b.score(this._weights) - a.score(this._weights));
	}

	add(element: ISearchElement) {
		this._elements.push(element);
	}
	
	remove(element: ISearchElement) {
		var i = this._elements.indexOf(element);
		if (i > -1) this._elements.splice(i,1);
	}
}

export interface ISearchElement {
	lastFilterValue : number;
	onBeginSearch(query : string);
	tags() : string[];
	pick();
	score( weights : SearchWeights ) : number;
	count( num : number ) : number;
}

export class SearchElement implements ISearchElement {
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
	filter(query: string, element: ISearchElement): number;
}

export class SublimeFilter implements IFilter {
	private regex: RegExp;

	onBeginSearch(query: string) {
		var r = query.replace(' ', '').split('').join('.*?');
		this.regex = new RegExp(r);
	}

	filter(query: string, element: ISearchElement): number {
		return Math.max.apply(null, element.tags().map((n) => {
			return this.regex.test(n) ? query.length / n.length : 0.0
		}));
	}
}
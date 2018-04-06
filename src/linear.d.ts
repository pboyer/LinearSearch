export declare class SearchOptions {
    filter: IFilter;
    items: ISearchItem[];
    filterThreshold: number;
    weights: SearchWeights;
}
export interface ILocalWeight {
    n: number;
    weight: number;
}
export declare class SearchWeights {
    baseValueWeight: number;
    sessionCountWeight: number;
    filterValueWeight: number;
    localWeights: ILocalWeight[];
}
export declare class Search {
    private _filter;
    private _items;
    private _weights;
    private _filterThreshold;
    constructor(options?: Partial<SearchOptions>);
    search(query: string): ISearchItem[];
    add(item: ISearchItem): void;
    remove(item: ISearchItem): void;
}
export interface ISearchItem {
    lastFilterValue: number;
    onBeginSearch(query: string): void;
    readonly tags: string[];
    pick(): void;
    score(weights: SearchWeights): number;
    count(num: number): number;
}
export declare class SearchItem implements ISearchItem {
    private _count;
    tags: string[];
    baseValue: number;
    sessionCount: number;
    lastFilterValue: number;
    constructor(tags: string[]);
    onBeginSearch(_: string): void;
    pick(): void;
    score(weights: SearchWeights): number;
    count(num: number): number;
}
export interface IFilter {
    onBeginSearch(query: string): void;
    filter(query: string, element: ISearchItem): number;
}
export declare class SublimeFilter implements IFilter {
    private regex;
    onBeginSearch(query: string): void;
    filter(query: string, item: ISearchItem): number;
}

export interface SearchQuery { query: string; scope: string[]; limit: number; }
export class SearchService { search(q: SearchQuery): { results: unknown[] } { return { results: [] }; } }

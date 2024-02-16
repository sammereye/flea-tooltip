import Item from './Item';
import MiniSearch, { SearchResult } from 'minisearch';

export default class Items {
  items: Item[];
  searchIndex: MiniSearch;

  constructor() {
    this.items = [];
  }

  async fetchItems(): Promise<void> {
    const res = await fetch('https://x9nv5nci18.execute-api.us-east-1.amazonaws.com/market-items');
    
    if (!(res.status == 200 || res.status == 204)) {
      throw new Error("Failed to fetch items");
    }

    const data: Item[] = await res.json();
    this.items = data;
  }
  
  initializeSearchIndex(): void {
    if (!this.itemsAreLoaded()) {
      throw new Error("Can't create search index for items, no items have been loaded");
    }

    this.searchIndex = new MiniSearch({
      fields: ['name', 'shortName'], // fields to index for full-text search
      searchOptions: {
        fuzzy: 0.2, 
        prefix: true,
        boost: {
          'shortName': 1.5
        }
      }
    });

    this.searchIndex.addAll(this.items);
  }

  search(searchQuery: string, lowestAcceptableScore = 0): Item {
    const searchResults = this.searchIndex.search(searchQuery);

    if (!(searchResults) || searchResults.length === 0) {
      return null;
    }

    const topResult: SearchResult = searchResults[0];
    const item = this.getItemById(topResult.id);

    console.log(`${searchQuery} : ${topResult.score}`)
    if (topResult.score <= lowestAcceptableScore && searchQuery.trim().toLowerCase() !== item.name.trim().toLowerCase()) {
      return null;
    }
    
    return item;
  }

  getItemById(id: string): Item {
    if (!this.itemsAreLoaded()) {
      throw new Error("Can't get items, no items have been loaded");
    }

    const itemsMatchedByFilter: Item[] = this.items.filter(item => item.id === id);

    if (itemsMatchedByFilter.length === 0) {
      return null;
    }
    
    return itemsMatchedByFilter[0];
  }

  itemsAreLoaded(): boolean {
    if (!(this.items) || this.items.length === 0) {
      return false;
    }

    return true;
  }
}
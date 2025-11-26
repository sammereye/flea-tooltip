import Item, { ItemTask } from "./Item";
import MiniSearch, { SearchResult } from "minisearch";
import request from "request";
import TarkovMarketItem from "./TarkovMarketItem";
import { Form } from "react-router-dom/dist";

export default class Items {
  items: Item[];
  searchIndex: MiniSearch;

  constructor() {
    this.items = [];
  }

  async fetchItems(): Promise<void> {
    // const itemsFromApi = await this.getItemsPromise();
    // console.log(itemsFromApi.length + " items fetched from API");
    // // const data = await response.json();
    // this.items = itemsFromApi;

    // OLD STUFF DOWN BELOW
    const res = await fetch("https://api.tarkov-market.app/api/v1/items/all", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": "EqQlalpnRwZswmhD",
      },
    });

    if (!(res.status == 200 || res.status == 204)) {
      throw new Error("Failed to fetch items");
    }

    const data: TarkovMarketItem[] = await res.json();
    const formattedData: Item[] = data.map((item: TarkovMarketItem) => {
      return {
        id: item.uid,
        name: item.name,
        shortName: item.shortName,
        availableOnFleaMarket: !item.bannedOnFlea,
        slots: item.slots,
        prices: {
          latest: item.price,
          avgDay: item.avg24hPrice,
          avgWeek: item.avg7daysPrice,
          trader: {
            name: item.traderName,
            price: item.traderPriceRub,
          },
        },
        tasks: [] as ItemTask[],
        icon: item.icon,
      };
    });

    this.items = formattedData;
  }

  // getItemsPromise(): Promise<Item[]> {
  //   const options = {
  //     method: "POST",
  //     url: "https://api.tarkov.dev/graphql",
  //     headers: {
  //       "sec-ch-ua":
  //         '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
  //       accept: "application/json",
  //       dnt: "1",
  //       "content-type": "application/json",
  //       "sec-ch-ua-mobile": "?0",
  //       "user-agent":
  //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  //       "sec-ch-ua-platform": '"Windows"',
  //       "sec-fetch-site": "same-origin",
  //       "sec-fetch-mode": "cors",
  //       "sec-fetch-dest": "empty",
  //       "accept-language": "en-US,en;q=0.9",
  //     },
  //     body: JSON.stringify({
  //       query:
  //         "{\n            itemsByType(type:any){\n                id\n                name\n                shortName\n                basePrice\n                normalizedName\n                types\n                width\n                height\n                avg24hPrice\n                wikiLink\n                changeLast48h\n                low24hPrice\n                high24hPrice\n                lastLowPrice\n            historicalPrices { price priceMin timestamp }\n                gridImageLink\n                iconLink\n                traderPrices {\n                    price\n                    trader {\n                        name\n                    }\n                }\n                sellFor {\n                    source\n                    price\n                    requirements {\n                        type\n                        value\n                    }\n                    currency\n                }\n                buyFor {\n                    source\n                    price\n                    currency\n                    requirements {\n                        type\n                        value\n                    }\n                }\n                containsItems {\n                    count\n                    item {\n                        id\n                    }\n                }\n            }\n        }",
  //     }),
  //   };

  //   return new Promise((resolve, reject) => {
  //     request(options, function (error, response) {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         const itemData = JSON.parse(response.body).data.itemsByType;

  //         const formattedData: Item[] = itemData.map((item: any) => {
  //           return {
  //             id: item.id,
  //             name: item.name,
  //             shortName: item.shortName,
  //             availableOnFleaMarket:
  //               item?.sellFor?.filter(
  //                 (x: { source: string }) => x.source === "fleaMarket"
  //               )?.length > 0,
  //             prices: {
  //               // latest:
  //               //   item.sellFor && Array.isArray(item.sellFor)
  //               //     ? item.sellFor.filter(
  //               //         (x: { source: string }) => x.source === "fleaMarket"
  //               //       ).length > 0
  //               //       ? item.sellFor.filter(
  //               //           (x: { source: string; price: number }) =>
  //               //             x.source === "fleaMarket"
  //               //         )[0].price
  //               //       : 0
  //               //     : 0,
  //               latest: item.avg24hPrice,
  //               avgDay: item.avg24hPrice,
  //               trader:
  //                 item.sellFor && Array.isArray(item.sellFor)
  //                   ? item.sellFor
  //                       .filter(
  //                         (x: { source: string }) => x.source !== "fleaMarket"
  //                       )
  //                       .map((x: { price: number; source: string }) => {
  //                         return {
  //                           name: x.source,
  //                           price: x.price,
  //                         };
  //                       })
  //                   : [],
  //             },
  //             slots: item.width * item.height,
  //             tasks: [] as ItemTask[],
  //             icon: item.iconLink,
  //           };
  //         });
  //         console.log(formattedData.length + " items loaded");
  //         console.log(JSON.stringify(itemData[0]));
  //         console.log(JSON.stringify(formattedData[0]));
  //         resolve(formattedData);
  //       }
  //     });
  //   });
  // }

  initializeSearchIndex(): void {
    if (!this.itemsAreLoaded()) {
      throw new Error(
        "Can't create search index for items, no items have been loaded"
      );
    }

    this.searchIndex = new MiniSearch({
      fields: ["name", "shortName"], // fields to index for full-text search
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
        boost: {
          shortName: 1.5,
        },
      },
    });

    this.searchIndex.addAll(this.items);
  }

  search(searchQuery: string, lowestAcceptableScore = 0): Item {
    const searchResults = this.searchIndex.search(searchQuery);

    if (!searchResults || searchResults.length === 0) {
      return null;
    }

    const topResult: SearchResult = searchResults[0];
    const item = this.getItemById(topResult.id);

    if (
      topResult.score <= lowestAcceptableScore &&
      searchQuery.trim().toLowerCase() !== item.name.trim().toLowerCase()
    ) {
      return null;
    }

    return item;
  }

  getItemById(id: string): Item {
    if (!this.itemsAreLoaded()) {
      throw new Error("Can't get items, no items have been loaded");
    }

    const itemsMatchedByFilter: Item[] = this.items.filter(
      (item) => item.id === id
    );

    if (itemsMatchedByFilter.length === 0) {
      return null;
    }

    return itemsMatchedByFilter[0];
  }

  itemsAreLoaded(): boolean {
    if (!this.items || this.items.length === 0) {
      return false;
    }

    return true;
  }
}

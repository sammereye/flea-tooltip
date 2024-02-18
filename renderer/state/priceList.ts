/* eslint-disable @typescript-eslint/ban-ts-comment */
import { hookstate } from "@hookstate/core";
import Item, { ClientItem } from "../../models/Item";
import IpcConstants from "../../models/IpcConstants";
import { getItemsPricePerSlot } from '../../utils';

export const PRICE_LIST = hookstate<ClientItem[]>([]);
export const TOOLTIPS_READY = hookstate<boolean | 'loading'>(false);

export function incomingItem(item: Item | null) {
  if (item) {
    const newItem = new ClientItem(item);
    PRICE_LIST.set(prevValue => {
      let existingItem = newItem;
      const checkForExistingItemFilter = [...prevValue].filter(x => x.id === item.id);
    
      if (checkForExistingItemFilter.length > 0) {
        existingItem = checkForExistingItemFilter[0];
      }

      existingItem.mostRecentlyAddedItem = true;

  
      return [...prevValue.filter(x => x.id !== existingItem.id).map(x => {
        return {
          ...x,
          mostRecentlyAddedItem: false
        }
      }), existingItem];
    });
  }
}

export function addToItemCount() {
  PRICE_LIST.set(prevValue => {
    const mostRecentlyAddedItemFilter = [...prevValue].filter(x => x.mostRecentlyAddedItem);
    
    if (mostRecentlyAddedItemFilter.length > 0) {
      const mostRecentlyAddedItem = mostRecentlyAddedItemFilter[0];
      mostRecentlyAddedItem.count += 1;
      console.log(mostRecentlyAddedItem.count);
      [...prevValue.filter(x => x.id !== mostRecentlyAddedItem.id), mostRecentlyAddedItem]
    }

    return prevValue;
  });
}

export function removeItemFromPriceList(item: Item | null) {
  if (item) {
    PRICE_LIST.set(prevValue => {      
      return [...prevValue].filter(x => x.id !== item.id);
    });
  } else {
    PRICE_LIST.set(prevValue => {
      let sortedItems = [...prevValue].sort((item1, item2) => getItemsPricePerSlot(item2 as Item) - getItemsPricePerSlot(item1 as Item));
      
      if (sortedItems.length > 0) {
        const lastItem = sortedItems[sortedItems.length - 1];
        sortedItems = sortedItems.filter(x => x.id !== lastItem.id);
      }

      return sortedItems;
    });
  }
}

export function enableTooltips() {
  TOOLTIPS_READY.set('loading');
  window.electron.enableTooltips();
}

// @ts-expect-error
window.electron.receive(IpcConstants.NewTooltipItem, (event: any, newItem: Item | null) => {
  incomingItem(newItem);
});

// @ts-expect-error
window.electron.receive(IpcConstants.DeleteItem, (event: any, newItem: Item | null) => {
  removeItemFromPriceList(newItem);
});

// @ts-expect-error
window.electron.receive(IpcConstants.AddToItemCount, (event: any) => {
  addToItemCount();
});

// @ts-expect-error
window.electron.receive(IpcConstants.TooltipsReady, (event: any) => {
  TOOLTIPS_READY.set(true);
});
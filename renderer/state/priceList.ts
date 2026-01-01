/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { hookstate } from "@hookstate/core";
import Item, { ClientItem } from "../../models/Item";
import IpcConstants from "../../models/IpcConstants";
import { getItemsPricePerSlot } from "../../utils";

export const PRICE_LIST = hookstate<ClientItem[]>([]);
export const TOOLTIPS_READY = hookstate<boolean | "loading">(false);
export const NO_SCANNING_CONFIG_FOUND = hookstate<boolean>(false);
export const IN_SCREEN_CONFIG = hookstate<boolean>(false);
export const SCREEN_CONFIG_STEP = hookstate<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);

export function incomingItem(item: Item | null) {
  if (item) {
    const newItem = new ClientItem(item);
    PRICE_LIST.set((prevValue) => {
      let existingItem = newItem;
      const checkForExistingItemFilter = [...prevValue].filter(
        (x) => x.id === item.id
      );

      if (checkForExistingItemFilter.length > 0) {
        existingItem = checkForExistingItemFilter[0];
      }

      existingItem.mostRecentlyAddedItem = true;

      return [
        ...prevValue
          .filter((x) => x.id !== existingItem.id)
          .map((x) => {
            return {
              ...x,
              mostRecentlyAddedItem: false,
            };
          }),
        existingItem,
      ];
    });
  }
}

export function addToItemCount() {
  PRICE_LIST.set((prevValue) => {
    const mostRecentlyAddedItemFilter = [...prevValue].filter(
      (x) => x.mostRecentlyAddedItem
    );

    if (mostRecentlyAddedItemFilter.length > 0) {
      const mostRecentlyAddedItem = mostRecentlyAddedItemFilter[0];
      mostRecentlyAddedItem.count += 1;
      [
        ...prevValue.filter((x) => x.id !== mostRecentlyAddedItem.id),
        mostRecentlyAddedItem,
      ];
    }

    return prevValue;
  });
}

export function removeItemFromPriceList(item: Item | null) {
  if (item) {
    PRICE_LIST.set((prevValue) => {
      return [...prevValue].filter((x) => x.id !== item.id);
    });
  } else {
    PRICE_LIST.set((prevValue) => {
      let sortedItems = [...prevValue].sort(
        (item1, item2) =>
          getItemsPricePerSlot(item2 as Item) -
          getItemsPricePerSlot(item1 as Item)
      );

      if (sortedItems.length > 0) {
        const lastItem = sortedItems[sortedItems.length - 1];
        sortedItems = sortedItems.filter((x) => x.id !== lastItem.id);
      }

      return sortedItems;
    });
  }
}

export function removeLastItemFromPriceList() {
  PRICE_LIST.set((prevValue) => {
    if (prevValue.length === 0) {
      return prevValue;
    }

    return prevValue.slice(0, -1);
  });
}

export function enableTooltips() {
  TOOLTIPS_READY.set("loading");
  window.electron.enableTooltips();
}

window.electron.receive(
  IpcConstants.NewTooltipItem,
  (_: never, newItem: Item | null) => {
    incomingItem(newItem);
  }
);

window.electron.receive(
  IpcConstants.DeleteItem,
  (event: never, newItem: Item | null) => {
    removeItemFromPriceList(newItem);
  }
);

window.electron.receive(IpcConstants.DeleteLastItem, (event: never) => {
  removeLastItemFromPriceList();
});

window.electron.receive(IpcConstants.AddToItemCount, () => {
  addToItemCount();
});

window.electron.receive(IpcConstants.StartScreenConfigure, () => {
  IN_SCREEN_CONFIG.set(true);
  SCREEN_CONFIG_STEP.set(1);
});

window.electron.receive(IpcConstants.EndScreenConfigure, () => {
  IN_SCREEN_CONFIG.set(false);
  SCREEN_CONFIG_STEP.set(0);
});

window.electron.receive(IpcConstants.ScreenConfigureStarted, () => {
  if (IN_SCREEN_CONFIG.get()) {
    SCREEN_CONFIG_STEP.set(2);
  }
});

window.electron.receive(IpcConstants.ScreenConfigureScanningSingleRow, () => {
  if (IN_SCREEN_CONFIG.get()) {
    SCREEN_CONFIG_STEP.set(3);
  }
});

window.electron.receive(IpcConstants.ScreenConfigureScannedSingleRow, () => {
  if (IN_SCREEN_CONFIG.get()) {
    SCREEN_CONFIG_STEP.set(4);
  }
});

window.electron.receive(IpcConstants.ScreenConfigureScanningDoubleRow, () => {
  if (IN_SCREEN_CONFIG.get()) {
    SCREEN_CONFIG_STEP.set(5);
  }
});

window.electron.receive(IpcConstants.ScreenConfigureScanComplete, () => {
  if (IN_SCREEN_CONFIG.get()) {
    SCREEN_CONFIG_STEP.set(6);
  }
});

window.electron.receive(IpcConstants.ScreenConfigureNeeded, () => {
  NO_SCANNING_CONFIG_FOUND.set(true);
});

window.electron.receive(IpcConstants.DisableScreenConfigureNeeded, () => {
  NO_SCANNING_CONFIG_FOUND.set(false);
});

window.electron.receive(IpcConstants.TooltipsReady, () => {
  TOOLTIPS_READY.set(true);
});

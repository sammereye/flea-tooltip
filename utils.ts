import Item from "./models/Item";

export function isDev() {
  return process.env["WEBPACK_SERVE"] === "true";
}

export function numberWithCommas(x: number | undefined) {
  if (x === undefined) {
    return x;
  }

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getItemsPricePerSlot(item: Item): number {
  const fleaPricePerSlot = Math.ceil(
    item.prices.avgDay > item.prices.latest
      ? item.prices.latest / item.slots
      : item.prices.avgDay / item.slots
  );
  let price = fleaPricePerSlot;

  if (!item.availableOnFleaMarket) {
    const traderPricePerSlot = Math.ceil(item.prices.trader.price / item.slots);
    price = traderPricePerSlot;
  }

  return price;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default class Item {
  id: string;
  name: string;
  shortName: string;
  availableOnFleaMarket: boolean;
  prices: ItemPrices;
  slots: number;
  tasks: ItemTask[]
}

type ItemPrices = {
  latest: number,
  avgDay: number,
  avgWeek: number,
  trader: TraderPrice
}

type TraderPrice = {
  name: string,
  price: number
}

type ItemTask = {
  task: string,
  count: number
}
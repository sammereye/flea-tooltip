import { PRICE_LIST, removeItemFromPriceList } from "../state/priceList";
import { ImmutableObject, useHookstate } from "@hookstate/core";
import {
  classNames,
  getItemsPricePerSlot,
  numberWithCommas,
} from "../../utils";
import { ClientItem } from "../../models/Item";
import MostRecentItem from "../components/MostRecentItem";

export default function PriceList() {
  const priceListHook = useHookstate(PRICE_LIST);
  const priceList = priceListHook.get();

  if (priceList) {
    const priceListSorted = [...priceList].sort(
      (item1, item2) =>
        getItemsPricePerSlot(item2 as ClientItem) -
        getItemsPricePerSlot(item1 as ClientItem)
    );
    const totalLootValue = [...priceList].reduce((total, item) => {
      const count = item.count > 0 ? item.count : 1;
      const price = item.availableOnFleaMarket
        ? item.prices.avgDay
        : item.prices.trader.price;
      return count * price + total;
    }, 0);

    return (
      <>
        <MostRecentItem
          item={
            priceListSorted.filter((x) => x.mostRecentlyAddedItem).length > 0
              ? (priceListSorted.filter(
                  (x) => x.mostRecentlyAddedItem
                )[0] as ClientItem)
              : null
          }
        />
        <div className="font-['Bender'] tracking-wide">
          <h2 className="font-black text-lg">
            Total Loot: <span className="font-['Nunito']">₽</span>
            {numberWithCommas(totalLootValue)}
          </h2>
          <div className="grid grid-cols-[auto_1fr] font-bold tracking-wide w-fit text-base">
            {priceListSorted.map((item, i) => {
              const fleaPricePerSlot = Math.ceil(
                item.prices.avgDay / item.slots
              );
              const traderPricePerSlot = Math.ceil(
                item.prices.trader.price / item.slots
              );

              return (
                <PriceListGridRow
                  key={item.id}
                  item={item}
                  fleaPricePerSlot={fleaPricePerSlot}
                  traderPricePerSlot={traderPricePerSlot}
                  lastItem={priceListSorted.length - 1 === i}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return <div></div>;
}

function PriceListGridRow({
  item,
  fleaPricePerSlot,
  traderPricePerSlot,
  lastItem,
}: {
  item: ImmutableObject<ClientItem>;
  fleaPricePerSlot: number;
  traderPricePerSlot: number;
  lastItem: boolean;
}) {
  return (
    <>
      <div
        className={classNames(
          item.mostRecentlyAddedItem ? "bg-blue-700 text-white" : "",
          lastItem ? "bg-red-700 text-white" : "",
          lastItem && item.mostRecentlyAddedItem
            ? "bg-purple-700 text-white"
            : "",
          "pl-2 font-black cursor-pointer"
        )}
        onClick={() => {
          removeItemFromPriceList(item as ClientItem);
        }}
      >
        <span>{item.shortName}</span>
        {item.count > 1 && <span> x {item.count}</span>}
        <span>: </span>
      </div>
      <div
        className={classNames(
          item.mostRecentlyAddedItem ? "bg-blue-700 text-white" : "",
          lastItem ? "bg-red-700 text-white" : "",
          lastItem && item.mostRecentlyAddedItem
            ? "bg-purple-700 text-white"
            : "",
          "pr-2 cursor-pointer"
        )}
        onClick={() => {
          removeItemFromPriceList(item as ClientItem);
        }}
      >
        {item.availableOnFleaMarket ? (
          <span>
            <span className="mr-1"></span>
            <span className="font-['Nunito']">₽</span>
            {numberWithCommas(fleaPricePerSlot)}
          </span>
        ) : (
          <span>
            <span className="mr-1"></span>
            <span className="font-['Nunito']">₽</span>
            {numberWithCommas(traderPricePerSlot)}
          </span>
        )}

        {item.slots > 1 && (
          <span>
            <span className="mr-1"></span>x {item.slots}
          </span>
        )}
      </div>
    </>
  );
}

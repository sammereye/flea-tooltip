import { PRICE_LIST, removeItemFromPriceList } from "../state/priceList";
import { ImmutableObject, useHookstate } from "@hookstate/core";
import {
  classNames,
  getItemsPricePerSlot,
  numberWithCommas,
} from "../../utils";
import { ClientItem } from "../../models/Item";
import MostRecentItem from "../components/MostRecentItem";
import NumberFlow, { useCanAnimate } from "@number-flow/react";

export default function PriceList() {
  const priceListHook = useHookstate(PRICE_LIST);
  const priceList = priceListHook.get();

  useCanAnimate({ respectMotionPreference: false });

  if (priceList) {
    const priceListSorted = [...priceList].sort(
      (item1, item2) =>
        getItemsPricePerSlot(item2 as ClientItem) -
        getItemsPricePerSlot(item1 as ClientItem)
    );
    const totalLootValue = [...priceList].reduce((total, item) => {
      const count = item.count > 0 ? item.count : 1;
      const price = getItemsPricePerSlot(item as ClientItem) * item.slots;
      return count * price + total;
    }, 0);

    return (
      <div className="tracking-wide">
        <div className="grid grid-cols-2">
          <div>
            <span className="uppercase text-xs font-bold">Total</span>
            <h2 className="flex justify-center flex-col bg-white text-stone-900 px-2 rounded h-7 w-40 font-['Bender']">
              <div className="flex items-end gap-0.5">
                <span className="font-['Nunito'] text-sm mb-1 font-black">
                  ₽
                </span>
                <span className="text-xl font-black tracking-wider">
                  <NumberFlow value={totalLootValue} />
                </span>
              </div>
            </h2>
          </div>
          {priceListSorted.length > 0 ? (
            <div>
              <span className="uppercase text-xs font-bold">Last Item</span>
              <h2 className="flex justify-center flex-col bg-white text-stone-900 px-2 rounded h-7 w-40 font-['Bender'] overflow-hidden">
                <div className="flex items-end gap-0.5 text-lg font-black tracking-tight whitespace-nowrap">
                  {priceListSorted[priceListSorted.length - 1].shortName}
                </div>
              </h2>
            </div>
          ) : null}
        </div>
        {/* <div className="flex flex-col gap-1.5 font-bold tracking-wide w-fit text-base mt-4">
          {priceListSorted.map((item, i) => {
            return (
              <PriceListGridRow
                key={item.id}
                item={item}
                lastItem={priceListSorted.length - 1 === i}
              />
            );
          })}
        </div> */}
        <div className="grid grid-cols-5 font-medium tracking-wide grid-rows-5 text-base mt-2 w-full grid-flow-col">
          {priceListSorted.map((item, i) => {
            return (
              <PriceListGridRow
                key={item.id}
                item={item}
                lastItem={priceListSorted.length - 1 === i}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return <div></div>;
}

function PriceListGridRow({
  item,
  lastItem,
}: {
  item: ImmutableObject<ClientItem>;
  lastItem: boolean;
}) {
  return (
    <div className="flex items-center max-w-full max-h-full overflow-hidden tracking-[-0.1px] border-b-[2px] border-r-[2px] border-stone-700">
      {/* <div className="h-9 w-9 flex items-center justify-center mr-1">
        <img
          src={item.icon}
          className="inline max-w-full max-h-full object-contain object-center"
        />
      </div> */}
      <div
        className={classNames(
          item.mostRecentlyAddedItem ? "bg-blue-700/50 text-white" : "",
          lastItem ? "bg-red-700/50 text-white" : "",
          lastItem && item.mostRecentlyAddedItem
            ? "bg-purple-700 text-white"
            : "",
          "flex items-center gap-1 w-full"
        )}
      >
        <div>
          <div
            className="px-2 font-bold cursor-pointer text-[11px] -mt-[3px] whitespace-nowrap"
            onClick={() => {
              removeItemFromPriceList(item as ClientItem);
            }}
          >
            {item.shortName}
          </div>
          <div
            className="px-0.5 cursor-pointer -mt-[12px] -mb-0.5 whitespace-nowrap h-[25px]"
            onClick={() => {
              removeItemFromPriceList(item as ClientItem);
            }}
          >
            <span className="text-[11px]">
              <span className="mr-1"></span>
              <span className="font-['Nunito'] mr-px text-[9px]">₽</span>
              {numberWithCommas(getItemsPricePerSlot(item as ClientItem))}
            </span>

            {item.slots > 1 && (
              <span className="ml-1 text-[8px] tracking-tight">per</span>
            )}

            {item.count > 1 && (
              <span className="ml-1 text-[8px] tracking-tight">
                x {item.count}
              </span>
            )}
          </div>
        </div>
        {/* {item.mostRecentlyAddedItem ? (
          <>
            <div className="flex items-center justify-around text-xs w-8 h-5 rounded bg-stone-600 font-bold">
              <span className="ml-0.5">F3</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="fill-white"
                width={12}
                height={12}
              >
                <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
              </svg>
            </div>
            <div className="flex items-center justify-center text-xs w-8 h-5 mr-2 rounded text-white font-bold">
              <span>F4</span>
              <span className="ml-px">+</span>
            </div>
          </>
        ) : lastItem ? (
          <div className="flex items-center justify-around text-xs w-8 h-5 mr-2 rounded bg-stone-600 font-bold">
            <span className="ml-0.5">F2</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="fill-white"
              width={12}
              height={12}
            >
              <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
            </svg>
          </div>
        ) : null} */}
      </div>
    </div>
  );
}

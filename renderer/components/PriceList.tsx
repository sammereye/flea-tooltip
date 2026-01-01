import {
  IN_SCREEN_CONFIG,
  NO_SCANNING_CONFIG_FOUND,
  PRICE_LIST,
  removeItemFromPriceList,
  SCREEN_CONFIG_STEP,
} from "../state/priceList";
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
  const inScreenConfigHook = useHookstate(IN_SCREEN_CONFIG);
  const screenConfigStepHook = useHookstate(SCREEN_CONFIG_STEP);
  const noScanningConfigFoundHook = useHookstate(NO_SCANNING_CONFIG_FOUND);
  const priceList = priceListHook.get();
  const inScreenConfig = inScreenConfigHook.get();
  const screenConfigStep: 0 | 1 | 2 | 3 | 4 | 5 | 6 =
    screenConfigStepHook.get();
  const noScanningConfigFound = noScanningConfigFoundHook.get();

  useCanAnimate({ respectMotionPreference: false });

  if (noScanningConfigFound) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-center">
        <h2 className="text-base font-bold mb-2">
          Initial Screen Calibration Needed
        </h2>
        <p className="text-sm">
          Please press F6 to start the screen scanning configuration process.
          This is a simple 30 second process to calibrate the OCR for your
          screen.
        </p>
      </div>
    );
  }

  if (inScreenConfig) {
    if (screenConfigStep === 1) {
      return (
        <div className="flex flex-col h-full justify-center items-center text-center">
          <h2 className="text-base font-bold mb-2">
            Screen Configuration Initializing
          </h2>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="size-6 animate-spin"
            >
              <path opacity=".4" fill="currentColor" d="" />
              <path
                fill="currentColor"
                d="M457 372c11.5 6.6 26.3 2.7 31.8-9.3 14.9-32.5 23.2-68.6 23.2-106.7 0-133.3-101.9-242.8-232-254.9-13.2-1.2-24 9.6-24 22.9s10.8 23.9 24 25.4c103.6 11.9 184 99.9 184 206.6 0 29.3-6.1 57.3-17 82.6-5.3 12.2-1.5 26.8 10 33.5z"
              />
            </svg>
          </div>
        </div>
      );
    } else if (screenConfigStep === 2) {
      return (
        <div className="flex flex-col h-full justify-center items-center text-center">
          <h2 className="text-base font-bold mb-2">
            Screen Configuration Started
          </h2>
          <p className="text-sm">
            Please hover over an item with a singular row of text such as an
            AI-2 medkit or your secure container until the tooltip appears.
            Then, without moving your mouse, press F6 and wait until the next
            step.
          </p>
        </div>
      );
    } else if (screenConfigStep === 3) {
      return (
        <div className="flex flex-col h-full justify-center items-center text-center">
          <h2 className="text-base font-bold mb-2">
            Scanning Single Row Dimensions
          </h2>
          <p className="text-sm text-red-500 font-bold mb-2">
            DON'T MOVE YOUR MOUSE
          </p>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="size-6 animate-spin"
            >
              <path opacity=".4" fill="currentColor" d="" />
              <path
                fill="currentColor"
                d="M457 372c11.5 6.6 26.3 2.7 31.8-9.3 14.9-32.5 23.2-68.6 23.2-106.7 0-133.3-101.9-242.8-232-254.9-13.2-1.2-24 9.6-24 22.9s10.8 23.9 24 25.4c103.6 11.9 184 99.9 184 206.6 0 29.3-6.1 57.3-17 82.6-5.3 12.2-1.5 26.8 10 33.5z"
              />
            </svg>
          </div>
        </div>
      );
    } else if (screenConfigStep === 4) {
      return (
        <div className="flex flex-col h-full justify-center items-center text-center">
          <h2 className="text-base font-bold mb-2">Single Row Scanned</h2>
          <p className="text-sm">
            Now, please hover over an item with two rows of text such as a
            VPO-215 Gornostay until the tooltip appears. Then, without moving
            your mouse, press F6 and wait until the next step.
          </p>
        </div>
      );
    } else if (screenConfigStep === 5) {
      return (
        <div className="flex flex-col h-full justify-center items-center text-center">
          <h2 className="text-base font-bold mb-2">
            Scanning Double Row Dimensions
          </h2>
          <p className="text-sm text-red-500 font-bold mb-2">
            DON'T MOVE YOUR MOUSE
          </p>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="size-6 animate-spin"
            >
              <path opacity=".4" fill="currentColor" d="" />
              <path
                fill="currentColor"
                d="M457 372c11.5 6.6 26.3 2.7 31.8-9.3 14.9-32.5 23.2-68.6 23.2-106.7 0-133.3-101.9-242.8-232-254.9-13.2-1.2-24 9.6-24 22.9s10.8 23.9 24 25.4c103.6 11.9 184 99.9 184 206.6 0 29.3-6.1 57.3-17 82.6-5.3 12.2-1.5 26.8 10 33.5z"
              />
            </svg>
          </div>
        </div>
      );
    } else if (screenConfigStep === 6) {
      return (
        <div className="flex flex-col h-full justify-center items-center text-center">
          <h2 className="text-base font-bold mb-2">Configuration Complete</h2>
          <p className="text-sm text-red-500 font-bold mb-2">
            PLEASE RESTART THIS APPLICATION TO SAVE CHANGES
          </p>
          <p className="text-sm">
            If you are still running into issues, please join our Discord for
            assistance.
          </p>
        </div>
      );
    }
  }

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
      <div className="tracking-wide flex flex-col h-full">
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
        <div className="grid grid-cols-5 grid-rows-5 font-medium tracking-wide text-base mt-1 w-full grid-flow-col grow max-h-[150px]">
          {priceListSorted.length > 21 ? (
            <div className="flex items-center max-w-full max-h-full overflow-hidden tracking-[-0.1px] odd:bg-white/10">
              <div className="relative flex items-center gap-1 w-full h-full">
                <div>
                  <div className="px-2 font-bold cursor-pointer text-[11px] -mt-[3px] whitespace-nowrap">
                    {priceListSorted.length - 21} items abv
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {priceListSorted.map((item, i) => {
            if (
              priceListSorted.length <= 21 ||
              (priceListSorted.length > 21 && i > priceListSorted.length - 21)
            ) {
              return (
                <PriceListGridRow
                  key={item.id}
                  item={item}
                  lastItem={priceListSorted.length - 1 === i}
                />
              );
            }
          })}
          <div className="flex flex-col h-full justify-center col-start-4 row-start-4 col-span-3 row-span-2 pl-2">
            <span className="uppercase text-xs font-bold">Total</span>
            <h2 className="flex justify-center flex-col bg-white text-stone-900 px-2 rounded h-7 w-full font-['Bender']">
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
    <div className="flex items-center max-w-full max-h-full overflow-hidden tracking-[-0.1px] odd:bg-white/10">
      {/* <div className="h-9 w-9 flex items-center justify-center mr-1">
        <img
          src={item.icon}
          className="inline max-w-full max-h-full object-contain object-center"
        />
      </div> */}
      <div className="relative flex items-center gap-1 w-full h-full">
        <div>
          <div
            className={classNames(
              "px-2 font-bold cursor-pointer text-[11px] -mt-[3px] whitespace-nowrap",
              lastItem && item.mostRecentlyAddedItem
                ? "text-purple-500"
                : item.mostRecentlyAddedItem
                ? "text-green-500"
                : lastItem
                ? "text-red-500"
                : ""
            )}
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

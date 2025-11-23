import React from "react";
import { TOOLTIP_ITEM } from "../state/tooltipItem";
import { useHookstate } from "@hookstate/core";
import { numberWithCommas } from "../../utils";
import { ItemTask } from "../../models/Item";

export function Tooltip() {
  const tooltipItem = useHookstate(TOOLTIP_ITEM);
  const item = tooltipItem.get();
  if (item) {
    const fleaPricePerSlot = Math.ceil(item.prices.avgDay / item.slots);
    const traderPricePerSlot = Math.ceil(item.prices.trader.price / item.slots);

    return (
      <div className="block items-center p-1.5 bg-white rounded h-fit w-fit text-sm text-stone-700 font-['Bender'] font-black tracking-wide">
        {/* ITEM NAME */}
        <div className="w-fit whitespace-nowrap text-[15px]">
          {item.shortName}
        </div>

        {/* FLEA MARKET */}
        <div className="whitespace-nowrap">
          {item.availableOnFleaMarket ? (
            <>
              <span className="tracking-wider">
                <span className="font-['Nunito']">₽</span>
                {numberWithCommas(fleaPricePerSlot)}
              </span>
              {item.slots > 1 && (
                <span>
                  <span className="mr-1"></span>x {item.slots}
                </span>
              )}
            </>
          ) : (
            <span>Unavailable on Flea</span>
          )}
        </div>

        {/* TRADER PRICE */}
        <div className="whitespace-nowrap">
          <span className="tracking-wider">
            <span className="font-['Nunito']">₽</span>
            {numberWithCommas(traderPricePerSlot)}
          </span>
          {item.slots > 1 && (
            <span>
              <span className="mr-1"></span>x {item.slots}
            </span>
          )}
          <span className="capitalize">
            <span className="mr-1"></span>(
            {tooltipItem.get()?.prices?.trader.name})
          </span>
        </div>

        {/* TASKS */}
        {item.tasks.map((task, index) => (
          <TooltipTask key={index} task={task} />
        ))}
      </div>
    );
  }

  return <div></div>;
}

function TooltipTask({ task }: { task: ItemTask }) {
  return (
    <div className="flex items-center whitespace-nowrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <span className="mx-1">{task.count} - </span>
      <span className="capitalize">{task.task}</span>
    </div>
  );
}

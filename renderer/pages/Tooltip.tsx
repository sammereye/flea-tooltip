import React from 'react';
import { TOOLTIP_ITEM } from "../state/tooltipItem";
import { useHookstate } from '@hookstate/core';

function numberWithCommas(x: number | undefined) {
  if (x === undefined) {
    return x
  }

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function Tooltip() {
  const tooltipItem = useHookstate(TOOLTIP_ITEM);
  if (tooltipItem.get() !== null) {
    return (
      <div className="font-['Nunito'] flex items-center p-1 bg-white rounded h-fit w-fit text-sm font-bold text-stone-800">
        <span>{tooltipItem.get()?.shortName}:</span>&nbsp;<span className='text-[15px] font-black'>₽{numberWithCommas(tooltipItem.get()?.prices?.latest)}</span>
      </div>
    )
  }

  return <div></div>;
}
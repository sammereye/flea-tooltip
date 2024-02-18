import React from 'react';
import { TOOLTIP_ITEM } from "../state/tooltipItem";
import { useHookstate } from '@hookstate/core';
import { numberWithCommas } from '../../utils';

export function Tooltip() {
  const tooltipItem = useHookstate(TOOLTIP_ITEM);
  const item = tooltipItem.get();
  if (item) {
    const fleaPricePerSlot = Math.ceil(item.prices.avgDay / item.slots);
    const traderPricePerSlot = Math.ceil(item.prices.trader.price / item.slots);

    return (
      <div className="inline-grid grid-cols-[auto_1fr] font-['Bender'] items-center p-1 bg-white rounded h-fit w-fit text-[15px] font-bold text-stone-800">
        <div className='w-fit whitespace-nowrap'>{item.shortName}:</div>
        <div className='font-extrabold whitespace-nowrap'>
          {item.availableOnFleaMarket ?
            <>
              <span className='tracking-wider'><span className="mr-1"></span><span className="font-['Nunito']">₽</span>{numberWithCommas(fleaPricePerSlot)}</span>
              {item.slots > 1 &&
                <span><span className="mr-1"></span>x {item.slots}</span>
              }
            </>
            :
            <span><span className="mr-1"></span>Unavailable on Flea</span>
          }
        </div>
        <div className='w-fit'></div>
        <div className='text-[15px] font-extrabold whitespace-nowrap'>
          <span className='tracking-wider'><span className="mr-1"></span><span className="font-['Nunito']">₽</span>{numberWithCommas(traderPricePerSlot)}</span>
          {item.slots > 1 &&
            <span><span className="mr-1"></span>x {item.slots}</span>
          }
          <span className='capitalize'><span className="mr-1"></span>({tooltipItem.get()?.prices?.trader.name})</span>
        </div>
      </div>
    )
  }

  return <div></div>;
}
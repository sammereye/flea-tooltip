import React from "react";
import { ClientItem } from '../../models/Item';

export default function MostRecentItem({ item }: { item: ClientItem | null }) {
  return (
    <div className="h-[150px] w-full">
      <div className="font-['Nunito'] text-xl font-bold">Most Recent Item</div>
      {item &&
        <div className="grid grid-cols-4 py-1">
          <img className="w-full h-auto" src={item.icon} />
          <div className="col-span-3 pl-2">
            <div className="text-xl font-semibold">{item.name}</div>
          </div>
        </div>
      }
    </div>
  )
}
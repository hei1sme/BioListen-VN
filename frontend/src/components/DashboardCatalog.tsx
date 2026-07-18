"use client";

import React from "react";
import { Compass } from "lucide-react";

interface SpeciesItem {
  id: string;
  name: string;
  scientific: string;
  frequencyRange: string;
  description: string;
  icon: string;
}

interface DashboardCatalogProps {
  catalog: SpeciesItem[];
}

export function DashboardCatalog({ catalog }: DashboardCatalogProps) {
  return (
    <div className="border border-border-deep bg-panel-bg p-5 rounded-[2px] font-mono shadow-lg">
      <h2 className="text-xs font-bold tracking-widest text-foreground/80 mb-4 flex items-center gap-2 uppercase">
        <Compass className="h-4 w-4 text-primary" /> Thư viện loài chỉ thị rừng đặc dụng
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {catalog.map((sp) => (
          <div
            key={sp.id}
            className="p-4 border border-border-deep bg-[#090d0b] hover:border-primary/50 transition-all duration-200 flex flex-col gap-2 rounded-[2px] shadow-md group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl bg-primary/10 p-2 border border-primary/20 rounded-[2px] group-hover:bg-primary/20 transition-all">
                {sp.icon}
              </span>
              <div>
                <h3 className="text-xs font-bold text-foreground">{sp.name}</h3>
                <p className="text-[9px] text-primary italic font-serif">{sp.scientific}</p>
              </div>
            </div>
            <div className="text-[9px] text-primary font-mono border-y border-border-deep py-1.5 mt-2 font-medium">
              TẦN SỐ ĐẶC TRƯNG: {sp.frequencyRange}
            </div>
            <p className="text-[10px] text-foreground/60 leading-relaxed text-justify mt-1 font-sans">
              {sp.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default DashboardCatalog;

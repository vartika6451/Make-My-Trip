import React, { useState } from 'react';
import { MapPin, PlaneTakeoff, Compass } from 'lucide-react';

interface DestinationInfo {
  name: string;
  coords: { x: number; y: number };
  deal: string;
  price: string;
}

const destinations: DestinationInfo[] = [
  { name: 'Delhi', coords: { x: 340, y: 130 }, deal: 'Flight from Mumbai starting at', price: '₹4,500' },
  { name: 'Mumbai', coords: { x: 330, y: 160 }, deal: 'Flight from Bangalore starting at', price: '₹3,200' },
  { name: 'London', coords: { x: 190, y: 80 }, deal: 'Direct flights from Delhi from', price: '₹38,000' },
  { name: 'Paris', coords: { x: 210, y: 95 }, deal: 'Summer holiday deal packages', price: '₹55,000' },
  { name: 'Tokyo', coords: { x: 440, y: 120 }, deal: 'Direct flights starting from', price: '₹48,000' },
  { name: 'New York', coords: { x: 90, y: 100 }, deal: 'Flights via London starting at', price: '₹62,000' },
];

export default function InteractiveMap() {
  const [selected, setSelected] = useState<DestinationInfo>(destinations[0]);

  return (
    <div className="glass rounded-3xl p-6 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Compass className="text-brand-accent animate-pulse" size={20} />
        Interactive Travel Map
      </h3>
      <p className="text-xs text-slate-500 mb-4 font-semibold">
        Click any marker on the map to explore current travel deals and flight offers.
      </p>

      <div className="relative w-full h-[240px] bg-sky-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60">
        {/* Simple World Map Outline represented as grid or shapes */}
        <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240">
          {/* Simple abstract continent shapes */}
          <path d="M50 80 Q 80 50 110 90 T 150 130 T 100 180 Z" fill="currentColor" />
          <path d="M160 50 Q 200 40 240 70 T 260 120 T 220 180 Z" fill="currentColor" />
          <path d="M290 80 Q 350 70 400 90 T 450 160 T 360 210 Z" fill="currentColor" />
        </svg>

        {/* Markers */}
        {destinations.map((dest) => (
          <button
            key={dest.name}
            onClick={() => setSelected(dest)}
            className="absolute p-1 -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
            style={{ left: `${dest.coords.x}px`, top: `${dest.coords.y}px` }}
          >
            <div className="relative">
              <MapPin
                size={22}
                className={`transition-all duration-300 ${
                  selected.name === dest.name
                    ? 'text-brand-accent scale-125 drop-shadow-[0_0_8px_rgba(255,107,53,0.6)]'
                    : 'text-brand-primary hover:text-brand-accent hover:scale-110'
                }`}
              />
              <span className="absolute left-6 top-1 text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-0.5 px-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                {dest.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all duration-300">
        <div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{selected.name} Deal</span>
          <p className="text-sm font-semibold mt-1 text-slate-700 dark:text-slate-200">{selected.deal}</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-brand-accent">{selected.price}</span>
          <button className="flex items-center gap-1 mt-1 text-xs text-brand-secondary font-bold hover:underline">
            <PlaneTakeoff size={12} /> Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

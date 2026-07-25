import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import type { DynamicPricingDetails, PriceHistory } from '../store/bookingStore';
import { TrendingUp, AlertTriangle, Calendar, Info, Clock, Check } from 'lucide-react';

interface PriceTrendsAndBreakdownProps {
  itemId: number;
  itemType: 'FLIGHT' | 'HOTEL';
  pricingDetails?: DynamicPricingDetails;
}

export default function PriceTrendsAndBreakdown({
  itemId,
  itemType,
  pricingDetails,
}: PriceTrendsAndBreakdownProps) {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/${itemType.toLowerCase()}s/${itemId}/price-history`);
        // Sort history by recordedAt date ascending
        const sorted = res.data.sort(
          (a: PriceHistory, b: PriceHistory) =>
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        );
        setHistory(sorted);
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError('Unable to load historical pricing trends.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [itemId, itemType]);

  if (!pricingDetails) {
    return (
      <div className="p-4 text-xs font-semibold text-slate-400">
        No pricing details available for this selection.
      </div>
    );
  }

  // Chart coordinate calculations
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const prices = history.map((h) => h.price);
  const maxPrice = prices.length ? Math.max(...prices) : pricingDetails.adjustedPrice;
  const minPrice = prices.length ? Math.min(...prices) : pricingDetails.originalPrice;
  const priceRange = maxPrice - minPrice || 1;

  // Generate plot points
  const points = history.map((item, index) => {
    const x = paddingLeft + (index / (history.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((item.price - minPrice) / priceRange) * chartHeight;
    return {
      x,
      y,
      price: item.price,
      date: new Date(item.recordedAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }),
    };
  });

  // SVG lines and paths
  const linePathD = points.length
    ? points.reduce(
        (acc, p, idx) => acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
        ''
      )
    : '';

  const areaPathD = points.length
    ? `${linePathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Get grid-line price milestones
  const midPrice = Math.round((maxPrice + minPrice) / 2);

  return (
    <div className="w-full border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs font-semibold animate-fade-in">
      
      {/* Surcharge breakdown items */}
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
            <Info size={16} className="text-brand-primary" /> Fare Surcharge Breakdown
          </h4>
          <p className="text-[10px] text-slate-400">See base fares and any dynamically calculated surcharges applied in real-time.</p>
        </div>

        <div className="space-y-2.5">
          {/* Base Fare */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/30">
            <div>
              <span className="block text-slate-700 dark:text-slate-300">Base Ticket Fare</span>
              <span className="text-[9px] text-slate-400 font-medium block">Standard baseline operational cost</span>
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">₹{pricingDetails.originalPrice.toLocaleString()}</span>
          </div>

          {/* Demand Surcharge */}
          <div className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
            pricingDetails.demandSurcharge > 0
              ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30'
              : 'bg-slate-50/30 border-slate-200/20 dark:bg-slate-800/10 dark:border-slate-800/30 opacity-60'
          }`}>
            <div>
              <span className={`block ${pricingDetails.demandSurcharge > 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500'}`}>
                High-Occupancy Demand Fee
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">Calculated from passenger volume & seat occupancy</span>
            </div>
            <span className={`font-bold ${pricingDetails.demandSurcharge > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`}>
              {pricingDetails.demandSurcharge > 0 ? `+ ₹${pricingDetails.demandSurcharge.toLocaleString()}` : <Check size={14} className="text-green-500 inline" />}
            </span>
          </div>

          {/* Seasonality Surcharge */}
          <div className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
            pricingDetails.seasonalitySurcharge > 0
              ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30'
              : 'bg-slate-50/30 border-slate-200/20 dark:bg-slate-800/10 dark:border-slate-800/30 opacity-60'
          }`}>
            <div>
              <span className={`block ${pricingDetails.seasonalitySurcharge > 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500'}`}>
                Peak Season Surcharge
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">Applied during holidays or premium travel periods</span>
            </div>
            <span className={`font-bold ${pricingDetails.seasonalitySurcharge > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`}>
              {pricingDetails.seasonalitySurcharge > 0 ? `+ ₹${pricingDetails.seasonalitySurcharge.toLocaleString()}` : <Check size={14} className="text-green-500 inline" />}
            </span>
          </div>

          {/* Weekend Surcharge */}
          <div className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
            pricingDetails.weekendSurcharge > 0
              ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30'
              : 'bg-slate-50/30 border-slate-200/20 dark:bg-slate-800/10 dark:border-slate-800/30 opacity-60'
          }`}>
            <div>
              <span className={`block ${pricingDetails.weekendSurcharge > 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500'}`}>
                Weekend Departure Surge
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">Applies to Friday, Saturday, and Sunday bookings</span>
            </div>
            <span className={`font-bold ${pricingDetails.weekendSurcharge > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`}>
              {pricingDetails.weekendSurcharge > 0 ? `+ ₹${pricingDetails.weekendSurcharge.toLocaleString()}` : <Check size={14} className="text-green-500 inline" />}
            </span>
          </div>

          {/* Last-Minute Surcharge */}
          <div className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${
            pricingDetails.lastMinuteSurcharge > 0
              ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30'
              : 'bg-slate-50/30 border-slate-200/20 dark:bg-slate-800/10 dark:border-slate-800/30 opacity-60'
          }`}>
            <div>
              <span className={`block ${pricingDetails.lastMinuteSurcharge > 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500'}`}>
                Last-Minute Booking Surcharge
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">Applied for departures/stays within 3 days of booking</span>
            </div>
            <span className={`font-bold ${pricingDetails.lastMinuteSurcharge > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`}>
              {pricingDetails.lastMinuteSurcharge > 0 ? `+ ₹${pricingDetails.lastMinuteSurcharge.toLocaleString()}` : <Check size={14} className="text-green-500 inline" />}
            </span>
          </div>
        </div>

        {/* Dynamic Pricing Explanations */}
        {pricingDetails.explanation && pricingDetails.explanation.length > 0 && (
          <div className="p-4 bg-blue-50/30 dark:bg-slate-800/20 border border-blue-100/50 dark:border-slate-700/50 rounded-2xl space-y-2">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 block uppercase tracking-wide">Pricing Advisory Notes</span>
            <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {pricingDetails.explanation.map((exp, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <AlertTriangle size={13} className="text-brand-accent mt-0.5 flex-shrink-0" />
                  <p>{exp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Trend Chart */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
            <TrendingUp size={16} className="text-brand-secondary" /> 15-Day Price Trends Chart
          </h4>
          <p className="text-[10px] text-slate-400">Hover over the coordinate points to view historical fares recorded over the past two weeks.</p>
        </div>

        {loading ? (
          <div className="h-[220px] w-full bg-slate-100 dark:bg-slate-800/30 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 font-bold">
            Recalculating historical vectors...
          </div>
        ) : error ? (
          <div className="h-[220px] w-full bg-red-50/30 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-3xl flex items-center justify-center text-red-500 text-center p-4">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="h-[220px] w-full bg-slate-100 dark:bg-slate-800/30 rounded-3xl flex items-center justify-center text-slate-400">
            No historical records discovered for this resource.
          </div>
        ) : (
          <div className="relative bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-3 shadow-inner">
            {/* Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-10 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl shadow-lg border border-slate-700 pointer-events-none transition-all duration-100"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <p className="text-[9px] text-slate-400 font-medium">{hoveredPoint.date}</p>
                <p className="text-brand-secondary font-black">₹{hoveredPoint.price.toLocaleString()}</p>
              </div>
            )}

            {/* Responsive SVG Chart */}
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
              <defs>
                <linearGradient id={`chart-grad-${itemId}-${itemType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B5ED7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0B5ED7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* horizontal gridlines */}
              <g stroke="#94a3b8" strokeOpacity="0.15" strokeDasharray="3 3">
                <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} />
                <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight / 2} />
                <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight} />
              </g>

              {/* Y Axis price tags */}
              <g fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end" className="opacity-80">
                <text x={paddingLeft - 8} y={paddingTop + 3}>₹{maxPrice.toLocaleString()}</text>
                <text x={paddingLeft - 8} y={paddingTop + chartHeight / 2 + 3}>₹{midPrice.toLocaleString()}</text>
                <text x={paddingLeft - 8} y={paddingTop + chartHeight + 3}>₹{minPrice.toLocaleString()}</text>
              </g>

              {/* Chart Shaded Area */}
              {areaPathD && (
                <path d={areaPathD} fill={`url(#chart-grad-${itemId}-${itemType})`} className="animate-fade-in" />
              )}

              {/* Chart line path */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#0B5ED7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Data Nodes */}
              {points.map((p, idx) => {
                const isHovered = hoveredPoint && hoveredPoint.x === p.x && hoveredPoint.y === p.y;
                return (
                  <g key={idx} className="group/node">
                    {/* Glowing highlight ring for hover */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        fill="#0B5ED7"
                        fillOpacity="0.15"
                        stroke="#0B5ED7"
                        strokeOpacity="0.3"
                        strokeWidth="1.5"
                      />
                    )}
                    
                    {/* Primary node circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 4.5 : 3}
                      fill={isHovered ? "#FF6B35" : "#0B5ED7"}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1.5}
                      className="transition-all duration-200 cursor-pointer"
                    />

                    {/* Larger hover active target area */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="12"
                      fill="transparent"
                      cursor="pointer"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}

              {/* X Axis dates */}
              {points.length >= 2 && (
                <g fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" className="opacity-90">
                  {/* First Date */}
                  <text x={points[0].x} y={svgHeight - paddingBottom + 20}>
                    {points[0].date}
                  </text>
                  {/* Mid Date */}
                  <text x={points[Math.floor(points.length / 2)].x} y={svgHeight - paddingBottom + 20}>
                    {points[Math.floor(points.length / 2)].date}
                  </text>
                  {/* Last Date */}
                  <text x={points[points.length - 1].x} y={svgHeight - paddingBottom + 20}>
                    {points[points.length - 1].date}
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

    </div>
  );
}
